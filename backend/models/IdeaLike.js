import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const IdeaLike = sequelize.define(
  "IdeaLike",
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
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["ideaId"] },
      { fields: ["userId"] },
      { fields: ["ideaId", "userId"], unique: true }, // Prevent duplicate likes
    ],
  }
);

export default IdeaLike;

