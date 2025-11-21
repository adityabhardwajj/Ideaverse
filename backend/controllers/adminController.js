import asyncHandler from "express-async-handler";
import { Op } from "sequelize";
import User from "../models/User.js";
import Idea from "../models/Idea.js";
import Job from "../models/Job.js";

export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, role, search } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const whereClause = {};
  if (role) whereClause.role = role;
  if (search) {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const [users, total] = await Promise.all([
    User.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      offset: offset,
      limit: limitNum,
    }),
    User.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    },
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id, {
    attributes: { exclude: ["password"] },
  });
  if (user) {
    res.json({ success: true, data: user });
  } else {
    res.status(404).json({ success: false, error: { message: "User not found", code: 404 } });
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (user) {
    await user.destroy();
    res.json({ success: true, message: "User removed" });
  } else {
    res.status(404).json({ success: false, error: { message: "User not found", code: 404 } });
  }
});

export const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, error: { message: "User not found", code: 404 } });
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  res.json({
    success: true,
    data: { isBlocked: user.isBlocked },
    message: user.isBlocked ? "User blocked" : "User unblocked",
  });
});

export const getAllIdeas = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

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
      order: [["createdAt", "DESC"]],
      offset: offset,
      limit: limitNum,
    }),
    Idea.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: {
      ideas,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    },
  });
});

export const deleteIdea = asyncHandler(async (req, res) => {
  const idea = await Idea.findByPk(req.params.id);
  if (!idea) {
    return res.status(404).json({ success: false, error: { message: "Idea not found", code: 404 } });
  }

  await idea.destroy();
  res.json({ success: true, message: "Idea deleted" });
});

export const getAllJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, search, status } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const whereClause = {};
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }
  if (status) whereClause.status = status;

  const [jobs, total] = await Promise.all([
    Job.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "postedBy",
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["createdAt", "DESC"]],
      offset: offset,
      limit: limitNum,
    }),
    Job.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: {
      jobs,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    },
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return res.status(404).json({ success: false, error: { message: "Job not found", code: 404 } });
  }

  await job.destroy();
  res.json({ success: true, message: "Job deleted" });
});

export const getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalIdeas, totalJobs, allUsers] = await Promise.all([
    User.count(),
    Idea.count(),
    Job.count(),
    User.findAll({
      attributes: ["role"],
    }),
  ]);

  // Group users by role manually
  const usersByRoleMap = {};
  allUsers.forEach((user) => {
    const role = user.role;
    usersByRoleMap[role] = (usersByRoleMap[role] || 0) + 1;
  });

  const [recentUsers, recentIdeas, recentJobs] = await Promise.all([
    User.findAll({
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
    Idea.findAll({
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
    Job.findAll({
      include: [
        {
          model: User,
          as: "postedBy",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    }),
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalIdeas,
        totalJobs,
        usersByRole: usersByRoleMap,
      },
      recent: {
        users: recentUsers,
        ideas: recentIdeas,
        jobs: recentJobs,
      },
    },
  });
});
