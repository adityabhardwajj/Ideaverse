import asyncHandler from "express-async-handler";
import ChatRoom from "../models/ChatRoom.js";
import ChatRoomParticipant from "../models/ChatRoomParticipant.js";
import Idea from "../models/Idea.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { Op } from "sequelize";

// Get all pitched ideas for investors to discuss
export const getPitchedIdeas = asyncHandler(async (req, res) => {
  if (req.user.role !== "investor" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied. Investor role required.", code: 403 },
    });
  }

  const ideas = await Idea.findAll({
    where: { isPitched: true },
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["pitchedAt", "DESC"]],
  });

  res.json({
    success: true,
    data: ideas,
  });
});

// Get or create private investor discussion room for an idea
export const getOrCreateInvestorDiscussion = asyncHandler(async (req, res) => {
  const { ideaId } = req.params;
  const userId = req.user._id || req.user.id;

  if (req.user.role !== "investor" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied. Investor role required.", code: 403 },
    });
  }

  const idea = await Idea.findByPk(ideaId, {
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  if (!idea.isPitched) {
    return res.status(400).json({
      success: false,
      error: { message: "This idea has not been pitched yet", code: 400 },
    });
  }

  // Find existing investor discussion room for this idea
  let chatRoom = await ChatRoom.findOne({
    where: {
      type: "investment",
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
      {
        model: Idea,
        as: "idea",
        attributes: ["id", "title", "description"],
        include: [
          {
            model: User,
            as: "createdBy",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
  });

  // If room doesn't exist, create it
  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      name: `Investment Discussion: ${idea.title}`,
      type: "investment",
      ideaId: ideaId,
      isActive: true,
      lastMessageAt: new Date(),
    });

    // Add the first investor as participant
    await ChatRoomParticipant.create({
      chatRoomId: chatRoom.id,
      userId: userId,
      role: "investor",
      joinedAt: new Date(),
    });
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
        role: "investor",
        joinedAt: new Date(),
      });
    }
  }

  // Reload with all participants and messages
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
        attributes: ["id", "title", "description"],
        include: [
          {
            model: User,
            as: "createdBy",
            attributes: ["id", "name", "email"],
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
        ],
        order: [["createdAt", "ASC"]],
        limit: 100,
      },
    ],
  });

  res.json({
    success: true,
    data: chatRoom,
  });
});

// Get all investor discussion rooms for the logged-in investor
export const getInvestorDiscussions = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  if (req.user.role !== "investor" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied. Investor role required.", code: 403 },
    });
  }

  // Get all investment chat rooms where user is a participant
  const participantRooms = await ChatRoomParticipant.findAll({
    where: { userId: userId },
    include: [
      {
        model: ChatRoom,
        as: "chatRoom",
        where: {
          type: "investment",
          isActive: true,
        },
        include: [
          {
            model: Idea,
            as: "idea",
            attributes: ["id", "title", "description"],
          },
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
      },
    ],
    order: [[{ model: ChatRoom, as: "chatRoom" }, "lastMessageAt", "DESC"]],
  });

  const rooms = participantRooms.map((p) => p.chatRoom).filter(Boolean);

  res.json({
    success: true,
    data: rooms,
  });
});

// Add investor to existing discussion
export const addInvestorToDiscussion = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { investorId } = req.body;
  const currentUserId = req.user._id || req.user.id;

  if (req.user.role !== "investor" && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied. Investor role required.", code: 403 },
    });
  }

  const chatRoom = await ChatRoom.findByPk(roomId);
  if (!chatRoom || chatRoom.type !== "investment") {
    return res.status(404).json({
      success: false,
      error: { message: "Investment discussion room not found", code: 404 },
    });
  }

  // Check if current user is already a participant
  const currentUserParticipant = await ChatRoomParticipant.findOne({
    where: {
      chatRoomId: roomId,
      userId: currentUserId,
    },
  });

  if (!currentUserParticipant && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "You must be a participant to add others", code: 403 },
    });
  }

  // Check if investor exists and has investor role
  const investor = await User.findByPk(investorId);
  if (!investor || investor.role !== "investor") {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid investor", code: 400 },
    });
  }

  // Check if already a participant
  const existingParticipant = await ChatRoomParticipant.findOne({
    where: {
      chatRoomId: roomId,
      userId: investorId,
    },
  });

  if (existingParticipant) {
    return res.status(400).json({
      success: false,
      error: { message: "Investor is already in this discussion", code: 400 },
    });
  }

  // Add investor
  await ChatRoomParticipant.create({
    chatRoomId: roomId,
    userId: investorId,
    role: "investor",
    joinedAt: new Date(),
  });

  res.json({
    success: true,
    message: "Investor added to discussion",
  });
});

