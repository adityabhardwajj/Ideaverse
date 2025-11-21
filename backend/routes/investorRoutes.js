import express from "express";
import {
  getPitchedIdeas,
  getOrCreateInvestorDiscussion,
  getInvestorDiscussions,
  addInvestorToDiscussion,
} from "../controllers/investorController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validateObjectId } from "../middleware/validation.js";

const router = express.Router();

router.use(protect);

// Get all pitched ideas
router.get("/pitched-ideas", getPitchedIdeas);

// Get all investor discussions for current user
router.get("/discussions", getInvestorDiscussions);

// Get or create discussion room for an idea
router.get("/discussions/idea/:ideaId", validateObjectId("ideaId"), getOrCreateInvestorDiscussion);

// Add another investor to a discussion
router.post("/discussions/:roomId/add-investor", validateObjectId("roomId"), addInvestorToDiscussion);

export default router;

