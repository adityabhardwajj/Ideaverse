import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Application = sequelize.define(
  "Application",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    applicantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Jobs",
        key: "id",
      },
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    portfolioUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expectedBudget: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("applied", "shortlisted", "rejected", "hired"),
      defaultValue: "applied",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["applicantId"] },
      { fields: ["jobId"] },
      { fields: ["status"] },
      { fields: ["applicantId", "jobId"], unique: true }, // Prevent duplicate applications
    ],
  }
);

export default Application;

