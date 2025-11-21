import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUserDashboard,
  updateUserProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} from "../middleware/validation.js";
import { authRateLimiter } from "../middleware/security.js";

const router = express.Router();

router.post("/register", authRateLimiter, validateRegister, registerUser);
router.post("/login", authRateLimiter, validateLogin, loginUser);
router.get("/profile", protect, getUserProfile);
router.get("/dashboard", protect, getUserDashboard);
router.put("/profile", protect, validateUpdateProfile, updateUserProfile);

export default router;

