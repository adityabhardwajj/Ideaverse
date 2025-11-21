import express from "express";
import { createServer } from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { setupHelmet, setupCors, globalRateLimiter } from "./middleware/security.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import logger from "./utils/logger.js";
import userRoutes from "./routes/userRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import investorRoutes from "./routes/investorRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import { initializeSocket } from "./socket/socketServer.js";

dotenv.config();

const app = express();
const server = createServer(app);

app.use(setupHelmet());
app.use(setupCors());

app.use(express.json({ limit: process.env.BODY_SIZE_LIMIT || "100kb" }));
app.use(express.urlencoded({ extended: true, limit: process.env.BODY_SIZE_LIMIT || "100kb" }));

app.use(globalRateLimiter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌌 IdeaVerse API is running...",
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/news", newsRoutes);

app.use(notFound);

app.use(errorHandler);

const io = initializeSocket(server);

const PORT = process.env.PORT || 5000;

// Start server after database connection
(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`💬 Socket.io server initialized`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
})();

export { io };
