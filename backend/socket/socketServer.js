import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ChatRoom from "../models/ChatRoom.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";
import Message from "../models/Message.js";
import MessageRead from "../models/MessageRead.js";

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:5173"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      socket.userId = user.id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    socket.join(`user:${socket.userId}`);

    socket.on("join-room", async (roomId) => {
      try {
        const chatRoom = await ChatRoom.findByPk(roomId, {
          include: [
            {
              model: ChatRoomParticipant,
              as: "participants",
            },
          ],
        });
        
        if (!chatRoom) {
          return socket.emit("error", { message: "Chat room not found" });
        }

        const isParticipant = chatRoom.participants.some(
          (p) => String(p.userId) === socket.userId
        );

        if (!isParticipant && socket.user.role !== "admin") {
          return socket.emit("error", { message: "Access denied" });
        }

        socket.join(`room:${roomId}`);
        socket.emit("joined-room", { roomId });

        socket.to(`room:${roomId}`).emit("user-joined", {
          userId: socket.userId,
          userName: socket.user.name,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(`room:${roomId}`);
      socket.emit("left-room", { roomId });
    });

    socket.on("send-message", async (data) => {
      try {
        const { roomId, text, attachments } = data;

        const chatRoom = await ChatRoom.findByPk(roomId, {
          include: [
            {
              model: ChatRoomParticipant,
              as: "participants",
            },
          ],
        });
        
        if (!chatRoom) {
          return socket.emit("error", { message: "Chat room not found" });
        }

        const isParticipant = chatRoom.participants.some(
          (p) => String(p.userId) === socket.userId
        );

        if (!isParticipant && socket.user.role !== "admin") {
          return socket.emit("error", { message: "Access denied" });
        }

        // Create message
        const newMessage = await Message.create({
          chatRoomId: chatRoom.id,
          senderId: parseInt(socket.userId),
          text: text.trim(),
          attachments: attachments || [],
        });

        // Mark as read by sender
        await MessageRead.create({
          messageId: newMessage.id,
          userId: parseInt(socket.userId),
          readAt: new Date(),
        });

        // Update last message time
        chatRoom.lastMessageAt = new Date();
        await chatRoom.save();

        // Get message with sender info
        const messageWithSender = await Message.findByPk(newMessage.id, {
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "name", "email", "role"],
            },
          ],
        });

        io.to(`room:${roomId}`).emit("new-message", {
          roomId,
          message: messageWithSender,
        });

        chatRoom.participants.forEach((participant) => {
          if (String(participant.userId) !== socket.userId) {
            io.to(`user:${participant.userId}`).emit("chat-notification", {
              roomId,
              message: messageWithSender,
            });
          }
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("typing", (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit("user-typing", {
        userId: socket.userId,
        userName: socket.user.name,
        roomId,
      });
    });

    socket.on("stop-typing", (data) => {
      const { roomId } = data;
      socket.to(`room:${roomId}`).emit("user-stopped-typing", {
        userId: socket.userId,
        roomId,
      });
    });

    socket.on("mark-read", async (data) => {
      try {
        const { roomId } = data;
        const chatRoom = await ChatRoom.findByPk(roomId);

        if (!chatRoom) {
          return socket.emit("error", { message: "Chat room not found" });
        }

        // Get all unread messages in this room
        const messages = await Message.findAll({
          where: { chatRoomId: chatRoom.id },
          include: [
            {
              model: MessageRead,
              as: "readBy",
              where: { userId: parseInt(socket.userId) },
              required: false,
            },
          ],
        });

        const unreadMessages = messages.filter((message) => {
          return !message.readBy || message.readBy.length === 0;
        });

        if (unreadMessages.length > 0) {
          await MessageRead.bulkCreate(
            unreadMessages.map((message) => ({
              messageId: message.id,
              userId: parseInt(socket.userId),
              readAt: new Date(),
            }))
          );
        }

        socket.emit("marked-read", { roomId });
      } catch (error) {
        socket.emit("error", { message: "Failed to mark as read" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
    });
  });

  return io;
};

