import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const ChatRoomParticipant = sequelize.define(
  "ChatRoomParticipant",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    chatRoomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "ChatRooms",
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
    role: {
      type: DataTypes.ENUM("creator", "freelancer", "recruiter", "admin", "investor"),
      allowNull: true,
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [
      { fields: ["chatRoomId"] },
      { fields: ["userId"] },
      { fields: ["chatRoomId", "userId"], unique: true },
    ],
  }
);

export default ChatRoomParticipant;

