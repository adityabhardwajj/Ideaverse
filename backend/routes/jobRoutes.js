import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
} from "../controllers/jobController.js";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import {
  validateCreateJob,
  validateUpdateJob,
  validateApplyJob,
  validateSearchJobs,
  validateObjectId,
} from "../middleware/validation.js";
import { checkOwnership } from "../middleware/authorization.js";
import Job from "../models/Job.js";

const router = express.Router();

router
  .route("/")
  .get(validateSearchJobs, getJobs)
  .post(protect, authorizeRoles("recruiter", "admin"), validateCreateJob, createJob);

router
  .route("/:id")
  .get(validateObjectId("id"), getJobById)
  .put(
    protect,
    validateObjectId("id"),
    checkOwnership(Job),
    validateUpdateJob,
    updateJob
  )
  .delete(protect, validateObjectId("id"), checkOwnership(Job), deleteJob);

router
  .route("/:id/apply")
  .post(protect, validateObjectId("id"), validateApplyJob, applyToJob);

router
  .route("/:id/applications")
  .get(protect, validateObjectId("id"), getJobApplications);

router
  .route("/:id/applications/:applicationId/status")
  .put(protect, validateObjectId("id"), validateObjectId("applicationId"), updateApplicationStatus);

export default router;


