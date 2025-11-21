import express from "express";
import {
  requestPasswordReset,
  resetPassword,
  requestEmailVerification,
  verifyEmail,
  refreshAccessToken,
  revokeRefreshToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateRequestPasswordReset,
  validateResetPassword,
  validateVerifyEmail,
} from "../middleware/validation.js";

const router = express.Router();

router.post("/request-password-reset", validateRequestPasswordReset, requestPasswordReset);
router.post("/reset-password", validateResetPassword, resetPassword);
router.post("/request-email-verify", protect, requestEmailVerification);
router.get("/verify-email", validateVerifyEmail, verifyEmail);
router.post("/refresh", refreshAccessToken);
router.post("/revoke", protect, revokeRefreshToken);

export default router;
