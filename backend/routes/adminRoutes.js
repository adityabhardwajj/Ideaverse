import express from "express";
import {
  getAllUsers,
  getAdminStats,
  getUserById,
  deleteUser,
  blockUser,
  getAllIdeas,
  deleteIdea,
  getAllJobs,
  deleteJob,
} from "../controllers/adminController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validation.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.get("/users/:id", validateObjectId("id"), getUserById);
router.delete("/users/:id", validateObjectId("id"), deleteUser);
router.put("/users/:id/block", validateObjectId("id"), blockUser);

router.get("/ideas", getAllIdeas);
router.delete("/ideas/:id", validateObjectId("id"), deleteIdea);

router.get("/jobs", getAllJobs);
router.delete("/jobs/:id", validateObjectId("id"), deleteJob);

export default router;

