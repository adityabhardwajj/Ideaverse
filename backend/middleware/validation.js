import { body, param, query, validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        code: 400,
        details: errors.array(),
      },
    });
  }
  next();
};

const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
    .trim();
};

export const validateObjectId = (field = "id") => {
  return param(field).custom((value) => {
    // For SQL databases, validate integer ID
    const id = parseInt(value, 10);
    if (isNaN(id) || id <= 0) {
      throw new Error(`Invalid ${field}`);
    }
    return true;
  });
};

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .customSanitizer(sanitizeString),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .matches(passwordRegex)
    .withMessage(
      "Password must be at least 8 characters with uppercase, lowercase, digit, and symbol"
    ),
  body("role")
    .optional()
    .isIn(["creator", "freelancer", "recruiter", "admin"])
    .withMessage("Invalid role"),
  validate,
];

export const validateLogin = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validate,
];

export const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .customSanitizer(sanitizeString),
  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("headline")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Headline must be less than 100 characters")
    .customSanitizer(sanitizeString),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters")
    .customSanitizer(sanitizeString),
  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array")
    .custom((skills) => {
      if (skills.length > 20) {
        throw new Error("Maximum 20 skills allowed");
      }
      return true;
    }),
  validate,
];

export const validatePasswordReset = [
  body("email").trim().isEmail().withMessage("Please provide a valid email").normalizeEmail(),
  validate,
];

export const validateRequestPasswordReset = validatePasswordReset;

export const validateResetPassword = [
  body("token").notEmpty().withMessage("Token is required"),
  body("newPassword")
    .matches(passwordRegex)
    .withMessage(
      "Password must be at least 8 characters with uppercase, lowercase, digit, and symbol"
    ),
  validate,
];

export const validateVerifyEmail = [
  query("token").notEmpty().withMessage("Token is required"),
  validate,
];

export const validateCreateIdea = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .customSanitizer(sanitizeString),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters")
    .customSanitizer(sanitizeString),
  body("tags")
    .optional({ values: "falsy" })
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (!Array.isArray(tags)) {
        throw new Error("Tags must be an array");
      }
      if (tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      if (tags.length > 0) {
        tags.forEach((tag) => {
          if (typeof tag !== "string" || tag.length > 30) {
            throw new Error("Each tag must be a string with max 30 characters");
          }
        });
      }
      return true;
    }),
  validate,
];

export const validateUpdateIdea = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .customSanitizer(sanitizeString),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters")
    .customSanitizer(sanitizeString),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array")
    .custom((tags) => {
      if (tags.length > 10) {
        throw new Error("Maximum 10 tags allowed");
      }
      return true;
    }),
  validate,
];

export const validateCreateJob = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .customSanitizer(sanitizeString),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters")
    .customSanitizer(sanitizeString),
  body("skills")
    .optional()
    .isArray()
    .withMessage("Skills must be an array")
    .custom((skills) => {
      if (skills.length > 20) {
        throw new Error("Maximum 20 skills allowed");
      }
      return true;
    }),
  body("budgetRange")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Budget range must be less than 100 characters")
    .customSanitizer(sanitizeString),
  body("isRemote").optional().isBoolean().withMessage("isRemote must be a boolean"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location must be less than 200 characters")
    .customSanitizer(sanitizeString),
  validate,
];

export const validateUpdateJob = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters")
    .customSanitizer(sanitizeString),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Description must be between 10 and 5000 characters")
    .customSanitizer(sanitizeString),
  body("skills").optional().isArray().withMessage("Skills must be an array"),
  body("budgetRange")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Budget range must be less than 100 characters")
    .customSanitizer(sanitizeString),
  body("isRemote").optional().isBoolean().withMessage("isRemote must be a boolean"),
  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location must be less than 200 characters")
    .customSanitizer(sanitizeString),
  body("status")
    .optional()
    .isIn(["open", "closed", "paused"])
    .withMessage("Status must be one of: open, closed, paused"),
  validate,
];

export const validateApplyJob = [
  body("coverLetter")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Cover letter must be less than 2000 characters")
    .customSanitizer(sanitizeString),
  body("portfolioUrl")
    .optional({ values: "falsy" })
    .trim()
    .custom((value) => {
      if (!value || value.trim() === "") {
        return true; // Allow empty strings
      }
      // Check if it's a valid URL
      try {
        new URL(value);
        return true;
      } catch {
        throw new Error("Portfolio URL must be a valid URL (e.g., https://example.com)");
      }
    }),
  body("expectedBudget")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("Expected budget must be less than 100 characters")
    .customSanitizer(sanitizeString),
  validate,
];

export const validateCreateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters")
    .customSanitizer(sanitizeString),
  validate,
];

export const validateUpdateComment = [
  body("text")
    .trim()
    .notEmpty()
    .withMessage("Comment text is required")
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters")
    .customSanitizer(sanitizeString),
  validate,
];

export const validateSearchIdeas = [
  query("search").optional().trim().customSanitizer(sanitizeString),
  query("tags")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        return value.split(",").every((tag) => tag.trim().length > 0);
      }
      return true;
    }),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sort")
    .optional()
    .isIn(["createdAt_desc", "createdAt_asc", "likes_desc", "title_asc"])
    .withMessage("Invalid sort option"),
  validate,
];

export const validateSearchJobs = [
  query("search").optional().trim().customSanitizer(sanitizeString),
  query("skills")
    .optional()
    .custom((value) => {
      if (typeof value === "string") {
        return value.split(",").every((skill) => skill.trim().length > 0);
      }
      return true;
    }),
  query("location").optional().trim().customSanitizer(sanitizeString),
  query("remote").optional().isBoolean().withMessage("Remote must be a boolean"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
  query("sort")
    .optional()
    .isIn(["createdAt_desc", "createdAt_asc", "title_asc"])
    .withMessage("Invalid sort option"),
  validate,
];

