import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Comment = sequelize.define(
  "Comment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    ideaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Ideas",
        key: "id",
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["ideaId"] },
      { fields: ["userId"] },
      { fields: ["ideaId", "createdAt"] },
    ],
  }
);

export default Comment;

