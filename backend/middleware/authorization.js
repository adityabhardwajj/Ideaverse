import Idea from "../models/Idea.js";
import Job from "../models/Job.js";
import Comment from "../models/Comment.js";

export const checkOwnership = (resourceModel) => {
  return async (req, res, next) => {
    try {
      const resource = await resourceModel.findByPk(req.params.id);
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: { message: "Resource not found", code: 404 },
        });
      }

      if (req.user.role === "admin") {
        req.resource = resource;
        return next();
      }

      const userId = req.user._id || req.user.id;
      let isOwner = false;
      
      // Check model name using tableName or name property
      const modelName = resourceModel.name || resourceModel.tableName;
      if (modelName === "Idea" || modelName === "Ideas") {
        isOwner = String(resource.createdById) === String(userId);
      } else if (modelName === "Job" || modelName === "Jobs") {
        isOwner = String(resource.postedById) === String(userId);
      }

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          error: { message: "Not authorized to perform this action", code: 403 },
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

export const checkCommentOwnership = async (req, res, next) => {
  try {
    const idea = await Idea.findByPk(req.params.ideaId);
    if (!idea) {
      return res.status(404).json({
        success: false,
        error: { message: "Idea not found", code: 404 },
      });
    }

    const comment = await Comment.findOne({
      where: {
        id: req.params.commentId,
        ideaId: req.params.ideaId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { message: "Comment not found", code: 404 },
      });
    }

    if (req.user.role === "admin") {
      req.idea = idea;
      req.comment = comment;
      return next();
    }

    const userId = req.user._id || req.user.id;
    if (String(comment.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        error: { message: "Not authorized to perform this action", code: 403 },
      });
    }

    req.idea = idea;
    req.comment = comment;
    next();
  } catch (error) {
    next(error);
  }
};

