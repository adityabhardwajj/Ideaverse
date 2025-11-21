import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../models/User.js";
import RefreshToken from "../models/RefreshToken.js";
import Token from "../models/Token.js";
import emailService from "../services/emailService.js";
import logger from "../utils/logger.js";

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = async (userId, deviceInfo = {}) => {
  const token = RefreshToken.generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

  await RefreshToken.create({
    token,
    userId,
    expiresAt,
    deviceInfo,
  });

  return token;
};

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: { message: "Refresh token is required", code: 400 },
    });
  }

  const tokenDoc = await RefreshToken.findOne({
    where: {
      token: refreshToken,
      revoked: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: { exclude: ["password"] },
      },
    ],
  });

  if (!tokenDoc || !tokenDoc.user) {
    return res.status(401).json({
      success: false,
      error: { message: "Invalid or expired refresh token", code: 401 },
    });
  }

  if (tokenDoc.user.isBlocked) {
    await tokenDoc.update({ revoked: true });
    return res.status(403).json({
      success: false,
      error: { message: "Account has been blocked", code: 403 },
    });
  }

  const accessToken = generateAccessToken(tokenDoc.user.id);

  res.json({
    success: true,
    data: {
      accessToken,
      refreshToken: tokenDoc.token,
    },
  });
});

export const revokeRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const userId = req.user._id || req.user.id;

  if (refreshToken) {
    await RefreshToken.update(
      { revoked: true },
      {
        where: {
          token: refreshToken,
          userId: userId,
        },
      }
    );
  } else {
    await RefreshToken.update(
      { revoked: true },
      {
        where: { userId: userId },
      }
    );
  }

  res.json({
    success: true,
    message: "Token revoked successfully",
  });
});

export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  }

  const resetToken = Token.generateToken();
  await Token.create({
    userId: user.id,
    token: resetToken,
    type: "passwordReset",
    expiresAt: new Date(Date.now() + 60 * 60 * 1000),
  });

  try {
    await emailService.sendPasswordResetEmail(user.email, resetToken, user.name);
    logger.info(`Password reset email sent to: ${user.email}`);
  } catch (error) {
    logger.error(`Failed to send password reset email: ${error.message}`);
  }

  res.json({
    success: true,
    message: "If an account exists with this email, a password reset link has been sent.",
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  // Hash the token to match how it's stored
  const hashedToken = require("crypto").createHash("sha256").update(token).digest("hex");

  const tokenDoc = await Token.findOne({
    where: {
      token: hashedToken,
      type: "passwordReset",
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!tokenDoc) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired reset token", code: 400 },
    });
  }

  const user = await User.findByPk(tokenDoc.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: "User not found", code: 404 },
    });
  }

  user.password = newPassword;
  await user.save();

  await tokenDoc.destroy();

  await RefreshToken.update(
    { revoked: true },
    {
      where: { userId: user.id },
    }
  );

  logger.info(`Password reset successful for user: ${user.email}`);

  res.json({
    success: true,
    message: "Password reset successfully",
  });
});

export const requestEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.isEmailVerified) {
    return res.status(400).json({
      success: false,
      error: { message: "Email already verified", code: 400 },
    });
  }

  const verificationToken = Token.generateToken();
  await Token.create({
    userId: user.id || user._id,
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

  res.json({
    success: true,
    message: "Verification email sent",
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const tokenDoc = await Token.findOne({
    where: {
      token,
      type: "emailVerification",
      expiresAt: { [Op.gt]: new Date() },
    },
  });

  if (!tokenDoc) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid or expired verification token", code: 400 },
    });
  }

  const user = await User.findByPk(tokenDoc.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: { message: "User not found", code: 404 },
    });
  }

  user.isEmailVerified = true;
  user.emailVerifiedAt = new Date();
  await user.save();

  await tokenDoc.destroy();

  logger.info(`Email verified for user: ${user.email}`);

  res.json({
    success: true,
    message: "Email verified successfully",
  });
});

export { generateAccessToken, generateRefreshToken };
