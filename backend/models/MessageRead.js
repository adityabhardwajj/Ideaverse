import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const MessageRead = sequelize.define(
  "MessageRead",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Messages",
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
    readAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
    indexes: [
      { fields: ["messageId"] },
      { fields: ["userId"] },
      { fields: ["messageId", "userId"], unique: true },
    ],
  }
);

export default MessageRead;

