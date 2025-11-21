import asyncHandler from "express-async-handler";
import { Op } from "sequelize";
import User from "../models/User.js";
import Idea from "../models/Idea.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Token from "../models/Token.js";
import emailService from "../services/emailService.js";
import logger from "../utils/logger.js";
import { generateAccessToken, generateRefreshToken } from "./authController.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return res.status(400).json({
      success: false,
      error: { message: "User already exists", code: 400 },
    });
  }

  const user = await User.create({ name, email, password, role });

  const verificationToken = Token.generateToken();
  await Token.create({
    userId: user.id,
    token: verificationToken,
    type: "emailVerification",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  try {
    await emailService.sendVerificationEmail(user.email, verificationToken, user.name);
    logger.info(`Verification email sent to: ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send verification email: ${error.message}`);
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: accessToken,
      refreshToken,
    },
    message: "Registration successful. Please check your email to verify your account.",
  });
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    logger.warn(`Login attempt failed: User not found - ${email}`);
    return res.status(401).json({
      success: false,
      error: { message: "Invalid credentials", code: 401 },
    });
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    logger.warn(`Login attempt failed: Invalid password - ${email}`);
    return res.status(401).json({
      success: false,
      error: { message: "Invalid credentials", code: 401 },
    });
  }

  logger.info(`User logged in: ${user.email}`);

  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id, {
    userAgent: req.headers["user-agent"],
    ip: req.ip,
  });

  res.json({
    success: true,
    data: {
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      token: accessToken,
      refreshToken,
    },
  });
});

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findByPk(userId, {
    attributes: { exclude: ["password"] },
  });
  res.json(user);
});

export const getUserDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;

  const [user, userIdeas, userJobs, applications] = await Promise.all([
    User.findByPk(userId, {
      attributes: { exclude: ["password"] },
    }),
    Idea.findAll({
      where: { createdById: userId },
      order: [["createdAt", "DESC"]],
      limit: 5, // Limit to 5 ideas
    }),
    Job.findAll({
      where: { postedById: userId },
      order: [["createdAt", "DESC"]],
      limit: 5, // Limit to 5 jobs
    }),
    Application.findAll({
      where: { applicantId: userId },
      include: [
        {
          model: Job,
          as: "job",
          include: [
            {
              model: User,
              as: "postedBy",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5, // Limit to 5 applications
    }),
  ]);

  const applicationDetails = applications.map((application) => {
    return {
      job: {
        _id: application.job.id,
        id: application.job.id,
        title: application.job.title,
        postedBy: application.job.postedBy,
      },
      application: {
        id: application.id,
        coverLetter: application.coverLetter,
        portfolioUrl: application.portfolioUrl,
        expectedBudget: application.expectedBudget,
        status: application.status,
        createdAt: application.createdAt,
      },
    };
  });

  res.json({
    success: true,
    data: {
      user,
      stats: {
        ideasCount: userIdeas.length,
        jobsPostedCount: userJobs.length,
        applicationsCount: applicationDetails.length,
      },
      ideas: userIdeas,
      jobsPosted: userJobs,
      applications: applicationDetails,
    },
  });
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id || req.user.id;
  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, email, headline, bio, skills } = req.body;

  if (name) user.name = name;
  if (email) {
    const emailExists = await User.findOne({
      where: {
        email,
        id: { [Op.ne]: user.id },
      },
    });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }
    user.email = email;
  }
  if (headline !== undefined) user.headline = headline;
  if (bio !== undefined) user.bio = bio;
  if (skills !== undefined) user.skills = skills;

  const updatedUser = await user.save();
  res.json({
    success: true,
    data: {
      _id: updatedUser.id,
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      headline: updatedUser.headline,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      isEmailVerified: updatedUser.isEmailVerified,
    },
  });
});
