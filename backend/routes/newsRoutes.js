import express from "express";
import { getTechNews, refreshTechNews } from "../controllers/newsController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getTechNews);
router.post("/refresh", protect, authorizeRoles("admin"), refreshTechNews);

export default router;

