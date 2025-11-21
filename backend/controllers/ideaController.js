import asyncHandler from "express-async-handler";
import { Op, Sequelize } from "sequelize";
import Idea from "../models/Idea.js";
import Comment from "../models/Comment.js";
import IdeaLike from "../models/IdeaLike.js";
import User from "../models/User.js";
import { validateObjectId } from "../middleware/validation.js";

export const createIdea = asyncHandler(async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      error: { message: "User not authenticated", code: 401 },
    });
  }
  
  const created = await Idea.create({
    title,
    description,
    tags: tags || [],
    createdById: userId,
  });
  
  const ideaWithAuthor = await Idea.findByPk(created.id, {
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email", "role"],
      },
    ],
  });
  
  res.status(201).json({
    success: true,
    data: ideaWithAuthor,
  });
});

export const getIdeas = asyncHandler(async (req, res) => {
  const {
    search,
    tags,
    page = 1,
    limit = 5,
    sort = "createdAt_desc",
  } = req.query;

  const whereClause = {};

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (tags) {
    const tagArray = typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;
    // For MySQL JSON arrays, search using LIKE for JSON string format
    const tagConditions = tagArray.map(tag => ({
      tags: {
        [Op.like]: `%"${tag}"%`
      }
    }));
    if (whereClause[Op.or]) {
      whereClause[Op.and] = [
        { [Op.or]: whereClause[Op.or] },
        { [Op.or]: tagConditions }
      ];
      delete whereClause[Op.or];
    } else {
      whereClause[Op.or] = tagConditions;
    }
  }

  const [sortField, sortOrder] = sort.split("_");
  const orderClause = [[sortField, sortOrder === "asc" ? "ASC" : "DESC"]];

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const [ideas, total] = await Promise.all([
    Idea.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: orderClause,
      offset: offset,
      limit: limitNum,
    }),
    Idea.count({ where: whereClause }),
  ]);

  const ideasWithAuthor = ideas.map((idea) => {
    const ideaObj = idea.toJSON();
    if (ideaObj.createdBy && !ideaObj.author) {
      ideaObj.author = ideaObj.createdBy;
    }
    return ideaObj;
  });

  res.json({
    success: true,
    data: ideasWithAuthor,
    meta: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
    },
  });
});

export const getIdeaById = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email", "role"],
      },
      {
        model: Comment,
        as: "comments",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
        order: [["createdAt", "ASC"]],
      },
      {
        model: IdeaLike,
        as: "likes",
        attributes: ["id", "userId"],
      },
    ],
  });

  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const ideaObj = idea.toJSON();
  if (ideaObj.createdBy && !ideaObj.author) {
    ideaObj.author = ideaObj.createdBy;
  }
  // Add likesCount for compatibility
  ideaObj.likesCount = ideaObj.likes ? ideaObj.likes.length : 0;

  res.json({
    success: true,
    data: ideaObj,
  });
});

export const updateIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  if (String(idea.createdById) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to update this idea", code: 403 },
    });
  }

  const { title, description, tags } = req.body;
  if (title !== undefined) idea.title = title;
  if (description !== undefined) idea.description = description;
  if (tags !== undefined) idea.tags = tags;

  const updated = await idea.save();
  
  const ideaWithAuthor = await Idea.findByPk(updated.id, {
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email", "role"],
      },
    ],
  });

  res.json({
    success: true,
    data: ideaWithAuthor,
  });
});

export const deleteIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  if (String(idea.createdById) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to delete this idea", code: 403 },
    });
  }

  await idea.destroy();

  res.json({
    success: true,
    message: "Idea deleted successfully",
  });
});

export const likeIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  
  const existingLike = await IdeaLike.findOne({
    where: {
      ideaId: idea.id,
      userId: userId,
    },
  });

  let liked = false;
  if (existingLike) {
    await existingLike.destroy();
    liked = false;
  } else {
    await IdeaLike.create({
      ideaId: idea.id,
      userId: userId,
    });
    liked = true;
  }

  const likesCount = await IdeaLike.count({
    where: { ideaId: idea.id },
  });

  res.json({
    success: true,
    data: { likesCount, liked },
  });
});

export const commentOnIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  
  const newComment = await Comment.create({
    ideaId: idea.id,
    userId: userId,
    text: req.body.text,
  });

  const commentWithUser = await Comment.findByPk(newComment.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: commentWithUser,
  });
});

export const updateComment = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.ideaId);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const comment = await Comment.findOne({
    where: {
      id: req.params.commentId,
      ideaId: req.params.ideaId,
    },
  });

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: { message: "Comment not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  if (String(comment.userId) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to update this comment", code: 403 },
    });
  }

  comment.text = req.body.text;
  await comment.save();
  
  const commentWithUser = await Comment.findByPk(comment.id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
  });

  res.json({
    success: true,
    data: commentWithUser,
  });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.ideaId);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const comment = await Comment.findOne({
    where: {
      id: req.params.commentId,
      ideaId: req.params.ideaId,
    },
  });

  if (!comment) {
    return res.status(404).json({
      success: false,
      error: { message: "Comment not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  if (String(comment.userId) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to delete this comment", code: 403 },
    });
  }

  await comment.destroy();

  res.json({
    success: true,
    message: "Comment deleted successfully",
  });
});

// Mark idea as pitched (for investment discussions)
export const pitchIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) {
    return res.status(404).json({
      success: false,
      error: { message: "Idea not found", code: 404 },
    });
  }

  const userId = req.user._id || req.user.id;
  // Only creator or admin can pitch an idea
  if (String(idea.createdById) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Access denied", code: 403 },
    });
  }

  idea.isPitched = true;
  idea.pitchedAt = new Date();
  await idea.save();
  
  const ideaWithAuthor = await Idea.findByPk(idea.id, {
    include: [
      {
        model: User,
        as: "createdBy",
        attributes: ["id", "name", "email", "role"],
      },
    ],
  });

  res.json({
    success: true,
    data: ideaWithAuthor,
    message: "Idea has been pitched and is now available for investor discussions",
  });
});