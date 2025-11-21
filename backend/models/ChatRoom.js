import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ChatRoom = sequelize.define(
  "ChatRoom",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("project", "job", "direct", "investment"),
      allowNull: false,
    },
    ideaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Ideas",
        key: "id",
      },
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Jobs",
        key: "id",
      },
    },
    lastMessageAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["type"] },
      { fields: ["isActive", "lastMessageAt"] },
      { fields: ["ideaId"] },
      { fields: ["jobId"] },
    ],
  }
);

export default ChatRoom;
