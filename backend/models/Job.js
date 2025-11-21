import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Job = sequelize.define(
  "Job",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    budgetRange: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    postedById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    isRemote: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("open", "closed", "paused"),
      defaultValue: "open",
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["postedById", "createdAt"] },
      { fields: ["status", "createdAt"] },
      { fields: ["isRemote", "location"] },
      { fields: ["title"] },
      // Note: TEXT columns (description) can't be indexed without key length in MySQL
    ],
  }
);

export default Job;
