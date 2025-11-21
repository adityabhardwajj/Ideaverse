import express from "express";
import {
  createIdea,
  getIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
  likeIdea,
  commentOnIdea,
  updateComment,
  deleteComment,
  pitchIdea,
} from "../controllers/ideaController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  validateCreateIdea,
  validateUpdateIdea,
  validateCreateComment,
  validateUpdateComment,
  validateSearchIdeas,
  validateObjectId,
} from "../middleware/validation.js";
import { checkOwnership } from "../middleware/authorization.js";
import Idea from "../models/Idea.js";

const router = express.Router();

router
  .route("/")
  .get(validateSearchIdeas, getIdeas)
  .post(protect, validateCreateIdea, createIdea);

router
  .route("/:id")
  .get(validateObjectId("id"), getIdeaById)
  .put(protect, validateObjectId("id"), checkOwnership(Idea), validateUpdateIdea, updateIdea)
  .delete(protect, validateObjectId("id"), checkOwnership(Idea), deleteIdea);

router.route("/:id/like").put(protect, validateObjectId("id"), likeIdea);

router.route("/:id/pitch").post(protect, validateObjectId("id"), pitchIdea);

router
  .route("/:ideaId/comments")
  .post(protect, validateObjectId("ideaId"), validateCreateComment, commentOnIdea);

router
  .route("/:ideaId/comments/:commentId")
  .put(protect, validateObjectId("ideaId"), validateObjectId("commentId"), validateUpdateComment, updateComment)
  .delete(protect, validateObjectId("ideaId"), validateObjectId("commentId"), deleteComment);

router
  .route("/:id/comment")
  .post(protect, validateObjectId("id"), validateCreateComment, (req, res, next) => {
    req.params.ideaId = req.params.id;
    commentOnIdea(req, res, next);
  });

export default router;


