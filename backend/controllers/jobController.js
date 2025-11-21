import asyncHandler from "express-async-handler";
import { Op, Sequelize } from "sequelize";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import User from "../models/User.js";

export const createJob = asyncHandler(async (req, res) => {
  const { title, description, skills, budgetRange, isRemote, location } = req.body;
  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  
  const created = await Job.create({
    title,
    description,
    skills: skills || [],
    budgetRange,
    isRemote: isRemote !== undefined ? isRemote : true,
    location,
    postedById: userId,
  });
  
  const jobWithPoster = await Job.findByPk(created.id, {
    include: [
      {
        model: User,
        as: "postedBy",
        attributes: ["id", "name", "role"],
      },
    ],
  });

  res.status(201).json({
    success: true,
    data: jobWithPoster,
  });
});

export const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    skills,
    location,
    remote,
    page = 1,
    limit = 5,
    sort = "createdAt_desc",
  } = req.query;

  const whereClause = { status: "open" };

  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } },
    ];
  }

  if (skills) {
    const skillsArray = typeof skills === "string" ? skills.split(",").map((s) => s.trim()) : skills;
    // For MySQL JSON arrays, search using LIKE for JSON string format
    const skillConditions = skillsArray.map(skill => ({
      skills: {
        [Op.like]: `%"${skill}"%`
      }
    }));
    if (whereClause[Op.or]) {
      whereClause[Op.and] = [
        { [Op.or]: whereClause[Op.or] },
        { [Op.or]: skillConditions }
      ];
      delete whereClause[Op.or];
    } else {
      whereClause[Op.or] = skillConditions;
    }
  }

  if (location) {
    whereClause.location = { [Op.like]: `%${location}%` };
  }

  if (remote !== undefined) {
    whereClause.isRemote = remote === "true" || remote === true;
  }

  const [sortField, sortOrder] = sort.split("_");
  const orderClause = [[sortField, sortOrder === "asc" ? "ASC" : "DESC"]];

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const [jobs, total] = await Promise.all([
    Job.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "postedBy",
          attributes: ["id", "name", "role"],
        },
      ],
      order: orderClause,
      offset: offset,
      limit: limitNum,
    }),
    Job.count({ where: whereClause }),
  ]);

  res.json({
    success: true,
    data: jobs,
    meta: {
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      totalItems: total,
    },
  });
});

export const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id, {
    include: [
      {
        model: User,
        as: "postedBy",
        attributes: ["id", "name", "role"],
      },
      {
        model: Application,
        as: "applications",
        include: [
          {
            model: User,
            as: "applicant",
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
  });

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  res.json({
    success: true,
    data: job,
  });
});

export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  if (
    String(job.postedById) !== String(userId) &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to update this job", code: 403 },
    });
  }

  const { title, description, skills, budgetRange, isRemote, location, status } = req.body;
  if (title !== undefined) job.title = title;
  if (description !== undefined) job.description = description;
  if (skills !== undefined) job.skills = skills;
  if (budgetRange !== undefined) job.budgetRange = budgetRange;
  if (isRemote !== undefined) job.isRemote = isRemote;
  if (location !== undefined) job.location = location;
  if (status !== undefined) job.status = status;

  const updated = await job.save();
  
  const jobWithPoster = await Job.findByPk(updated.id, {
    include: [
      {
        model: User,
        as: "postedBy",
        attributes: ["id", "name", "role"],
      },
    ],
  });

  res.json({
    success: true,
    data: jobWithPoster,
  });
});

export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  if (
    String(job.postedById) !== String(userId) &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to delete this job", code: 403 },
    });
  }

  await job.destroy();

  res.json({
    success: true,
    message: "Job deleted successfully",
  });
});

export const applyToJob = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  if (job.status !== "open") {
    return res.status(400).json({
      success: false,
      error: { message: "This job is no longer accepting applications", code: 400 },
    });
  }

  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  const existing = await Application.findOne({
    where: {
      jobId: job.id,
      applicantId: userId,
    },
  });
  
  if (existing) {
    return res.status(400).json({
      success: false,
      error: { message: "You have already applied to this job", code: 400 },
    });
  }

  await Application.create({
    jobId: job.id,
    applicantId: userId,
    coverLetter: req.body.coverLetter || "",
    portfolioUrl: req.body.portfolioUrl || "",
    expectedBudget: req.body.expectedBudget || "",
    status: "applied",
  });

  res.status(201).json({
    success: true,
    message: "Application submitted successfully",
  });
});

export const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findByPk(req.params.id);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  if (String(job.postedById) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to view applications", code: 403 },
    });
  }

  const applications = await Application.findAll({
    where: { jobId: job.id },
    include: [
      {
        model: User,
        as: "applicant",
        attributes: ["id", "name", "email", "headline", "skills"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json({
    success: true,
    data: applications,
  });
});

export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["applied", "shortlisted", "rejected", "hired"];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid status", code: 400 },
    });
  }

  const job = await Job.findByPk(req.params.id);
  if (!job) {
    return res.status(404).json({
      success: false,
      error: { message: "Job not found", code: 404 },
    });
  }

  const userId = req.user.id; // Sequelize uses 'id', not '_id'
  if (String(job.postedById) !== String(userId) && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: { message: "Not authorized to update application status", code: 403 },
    });
  }

  const application = await Application.findOne({
    where: {
      id: req.params.applicationId,
      jobId: req.params.id,
    },
  });

  if (!application) {
    return res.status(404).json({
      success: false,
      error: { message: "Application not found", code: 404 },
    });
  }

  application.status = status;
  await application.save();

  res.json({
    success: true,
    data: application,
  });
});
