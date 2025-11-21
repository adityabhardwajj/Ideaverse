import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import logger from "../utils/logger.js";

export const setupHelmet = () => {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });
};

export const setupCors = () => {
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["http://localhost:5173", "http://localhost:3000"];

  return cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
};

export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // Already in milliseconds
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || process.env.RATE_LIMIT_MAX || "100"),
  message: {
    success: false,
    error: {
      message: "Too many requests from this IP, please try again later",
      code: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      error: {
        message: "Too many requests from this IP, please try again later",
        code: 429,
      },
    });
  },
});

// In development, allow more attempts; in production, use stricter limits
const authRateLimitMax = process.env.NODE_ENV === "production" 
  ? parseInt(process.env.AUTH_RATE_LIMIT_MAX || "5")
  : parseInt(process.env.AUTH_RATE_LIMIT_MAX || "50"); // 50 attempts in development

export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "15") * 60 * 1000, // 15 minutes default
  max: authRateLimitMax,
  message: {
    success: false,
    error: {
      message: "Too many authentication attempts, please try again later",
      code: 429,
    },
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    const windowMs = parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS || "15") * 60 * 1000;
    const resetTime = new Date(Date.now() + windowMs);
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}, email: ${req.body?.email || "unknown"}`);
    res.status(429).json({
      success: false,
      error: {
        message: `Too many authentication attempts. Please try again after ${resetTime.toLocaleTimeString()}`,
        code: 429,
        retryAfter: resetTime.toISOString(),
      },
    });
  },
});

export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    error: {
      message: "Too many password reset requests, please try again later",
      code: 429,
    },
  },
});

