import { DataTypes } from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/db.js";

const RefreshToken = sequelize.define(
  "RefreshToken",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deviceInfo: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    revoked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["userId", "revoked"] },
      { fields: ["token", "revoked"] },
      { fields: ["expiresAt"] },
    ],
  }
);

// Static method to generate token
RefreshToken.generateToken = () => {
  return crypto.randomBytes(40).toString("hex");
};

export default RefreshToken;
