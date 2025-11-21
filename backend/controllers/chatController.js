import asyncHandler from "express-async-handler";
import { Op } from "sequelize";
import ChatRoom from "../models/ChatRoom.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";
import Message from "../models/Message.js";
import MessageRead from "../models/MessageRead.js";
import Idea from "../models/Idea.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";
import { validateObjectId } from "../middleware/validation.js";

export const getOrCreateProjectChat = asyncHandler(async (req, res) => {
  const { ideaId } = req.params;
  const userId = req.user._id || req.user.id;

  const idea = await Idea.findByPk(ideaId);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const hasAccess =
    String(idea.createdById) === String(userId) ||
    req.user.role === "admin";

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied to this project chat", code: 403 },
    });
  }

  let chatRoom = await ChatRoom.findOne({
    where: {
      type: "project",
      ideaId: ideaId,
      isActive: true,
    },
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      },
    ],
  });

  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      name: `Project: ${idea.title}`,
      type: "project",
      ideaId: ideaId,
      isActive: true,
      lastMessageAt: new Date(),
    });

    // Add creator as participant
    await ChatRoomParticipant.create({
      chatRoomId: chatRoom.id,
      userId: idea.createdById,
      role: "creator",
      joinedAt: new Date(),
    });

    // Add current user if not the creator
    if (String(idea.createdById) !== String(userId)) {
      await ChatRoomParticipant.create({
        chatRoomId: chatRoom.id,
        userId: userId,
        role: req.user.role,
        joinedAt: new Date(),
      });
    }
  } else {
    // Check if user is already a participant
    const isParticipant = await ChatRoomParticipant.findOne({
      where: {
        chatRoomId: chatRoom.id,
        userId: userId,
      },
    });

    // If not a participant, add them
    if (!isParticipant) {
      await ChatRoomParticipant.create({
        chatRoomId: chatRoom.id,
        userId: userId,
        role: req.user.role,
        joinedAt: new Date(),
      });
    }
  }

  // Reload with all participants
  chatRoom = await ChatRoom.findByPk(chatRoom.id, {
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      },
      {
        model: Idea,
        as: "idea",
        attributes: ["id", "title"],
      },
    ],
  });

  res.json({
    success: true,
    data: chatRoom,
  });
});

export const getOrCreateJobChat = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const userId = req.user._id || req.user.id;

  const job = await Job.findByPk(jobId, {
    include: [
      {
        model: User,
        as: "postedBy",
        attributes: ["id"],
      },
    ],
  });
  
  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  const isRecruiter = String(job.postedById) === String(userId);
  
  // Check if user has applied to this job
  const application = await Application.findOne({
    where: {
      jobId: job.id,
      applicantId: userId,
    },
  });
  const isApplicant = !!application;
  
  const hasAccess = isRecruiter || isApplicant || req.user.role === "admin";

  if (!hasAccess) {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied to this job chat", code: 403 },
    });
  }

  let chatRoom = await ChatRoom.findOne({
    where: {
      type: "job",
      jobId: jobId,
      isActive: true,
    },
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      },
    ],
  });

  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      name: `Job: ${job.title}`,
      type: "job",
      jobId: jobId,
      isActive: true,
      lastMessageAt: new Date(),
    });

    // Add recruiter as participant
    await ChatRoomParticipant.create({
      chatRoomId: chatRoom.id,
      userId: job.postedById,
      role: "recruiter",
      joinedAt: new Date(),
    });

    // Add applicant if they applied
    if (isApplicant) {
      await ChatRoomParticipant.create({
        chatRoomId: chatRoom.id,
        userId: userId,
        role: "freelancer",
        joinedAt: new Date(),
      });
    }
  } else {
    // Check if user is already a participant
    const isParticipant = await ChatRoomParticipant.findOne({
      where: {
        chatRoomId: chatRoom.id,
        userId: userId,
      },
    });

    // If not a participant, add them
    if (!isParticipant && (isRecruiter || isApplicant)) {
      await ChatRoomParticipant.create({
        chatRoomId: chatRoom.id,
        userId: userId,
        role: isRecruiter ? "recruiter" : "freelancer",
        joinedAt: new Date(),
      });
    }
  }

  // Reload with all participants
  chatRoom = await ChatRoom.findByPk(chatRoom.id, {
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      },
      {
        model: Job,
        as: "job",
        attributes: ["id", "title"],
      },
    ],
  });

  res.json({
    success: true,
    data: chatRoom,
  });
});

export const getUserChatRooms = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const { type } = req.query;

  const whereClause = {
    isActive: true,
  };

  if (type && ["project", "job", "direct", "investment"].includes(type)) {
    whereClause.type = type;
  }

  // Get all chat rooms where user is a participant
  const participantRooms = await ChatRoomParticipant.findAll({
    where: { userId: userId },
    include: [
      {
        model: ChatRoom,
        as: "chatRoom",
        where: whereClause,
        include: [
          {
            model: ChatRoomParticipant,
            as: "participants",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id", "name", "email", "role"],
              },
            ],
          },
          {
            model: Idea,
            as: "idea",
            attributes: ["id", "title"],
            required: false,
          },
          {
            model: Job,
            as: "job",
            attributes: ["id", "title"],
            required: false,
          },
        ],
        order: [["lastMessageAt", "DESC"]],
      },
    ],
    limit: 50,
  });

  const chatRooms = participantRooms
    .map((p) => p.chatRoom)
    .filter(Boolean)
    .sort((a, b) => {
      const dateA = new Date(a.lastMessageAt || 0);
      const dateB = new Date(b.lastMessageAt || 0);
      return dateB - dateA;
    });

  res.json({
    success: true,
    data: chatRooms,
  });
});

export const getChatRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id || req.user.id;

  const chatRoom = await ChatRoom.findByPk(roomId, {
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      },
      {
        model: Message,
        as: "messages",
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: MessageRead,
            as: "readBy",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id"],
              },
            ],
          },
        ],
        order: [["createdAt", "ASC"]],
        limit: 100,
      },
      {
        model: Idea,
        as: "idea",
        attributes: ["id", "title"],
        required: false,
      },
      {
        model: Job,
        as: "job",
        attributes: ["id", "title"],
        required: false,
      },
    ],
  });

  if (!chatRoom) {
    return res.status(404).json({
      success: false,
      error: { message: "Chat room not found", code: 404 },
    });
  }

  const isParticipant = chatRoom.participants.some(
    (p) => String(p.user.id) === String(userId)
  );

  if (!isParticipant && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied", code: 403 },
    });
  }

  // Mark messages as read
  if (chatRoom.messages && chatRoom.messages.length > 0) {
    const unreadMessages = chatRoom.messages.filter((message) => {
      const alreadyRead = message.readBy.some(
        (read) => String(read.userId) === String(userId)
      );
      return !alreadyRead;
    });

    if (unreadMessages.length > 0) {
      await MessageRead.bulkCreate(
        unreadMessages.map((message) => ({
          messageId: message.id,
          userId: userId,
          readAt: new Date(),
        }))
      );
    }
  }

  // Reload to get updated read status
  const updatedChatRoom = await ChatRoom.findByPk(roomId, {
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      },
      {
        model: Message,
        as: "messages",
        include: [
          {
            model: User,
            as: "sender",
            attributes: ["id", "name", "email", "role"],
          },
          {
            model: MessageRead,
            as: "readBy",
            include: [
              {
                model: User,
                as: "user",
                attributes: ["id"],
              },
            ],
          },
        ],
        order: [["createdAt", "ASC"]],
        limit: 100,
      },
      {
        model: Idea,
        as: "idea",
        attributes: ["id", "title"],
        required: false,
      },
      {
        model: Job,
        as: "job",
        attributes: ["id", "title"],
        required: false,
      },
    ],
  });

  res.json({
    success: true,
    data: updatedChatRoom,
  });
});

export const sendMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { text, attachments } = req.body;
  const userId = req.user._id || req.user.id;

  const chatRoom = await ChatRoom.findByPk(roomId, {
    include: [
      {
        model: ChatRoomParticipant,
        as: "participants",
      },
    ],
  });
  
  if (!chatRoom) {
    return res.status(404).json({
      success: false,
      error: { message: "Chat room not found", code: 404 },
    });
  }

  const isParticipant = chatRoom.participants.some(
    (p) => String(p.userId) === String(userId)
  );

  if (!isParticipant && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied", code: 403 },
    });
  }

  // Create message
  const newMessage = await Message.create({
    chatRoomId: chatRoom.id,
    senderId: userId,
    text: text.trim(),
    attachments: attachments || [],
  });

  // Mark as read by sender
  await MessageRead.create({
    messageId: newMessage.id,
    userId: userId,
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
      {
        model: MessageRead,
        as: "readBy",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id"],
          },
        ],
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: messageWithSender,
  });
});

export const markAsRead = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user._id || req.user.id;

  const chatRoom = await ChatRoom.findByPk(roomId);
  if (!chatRoom) {
    return res.status(404).json({
      success: false,
      error: { message: "Chat room not found", code: 404 },
    });
  }

  // Get all unread messages in this room
  const messages = await Message.findAll({
    where: { chatRoomId: chatRoom.id },
    include: [
      {
        model: MessageRead,
        as: "readBy",
        where: { userId: userId },
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
        userId: userId,
        readAt: new Date(),
      }))
    );
  }

  res.json({
    success: true,
    message: "Messages marked as read",
  });
});

