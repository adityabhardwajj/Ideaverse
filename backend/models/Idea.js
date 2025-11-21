import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Idea = sequelize.define(
  "Idea",
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
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isPitched: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    pitchedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdById: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["createdById", "createdAt"] },
      // Note: MySQL doesn't support direct indexing on JSON columns
      // Tags are stored as JSON and can be searched using JSON functions
      // Note: TEXT columns (description) can't be indexed without key length
      { fields: ["createdAt"] },
      { fields: ["title"] },
      { fields: ["isPitched"] },
    ],
  }
);

export default Idea;
