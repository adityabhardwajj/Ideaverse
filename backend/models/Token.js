import { DataTypes } from "sequelize";
import crypto from "crypto";
import { sequelize } from "../config/db.js";

const Token = sequelize.define(
  "Token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM("emailVerification", "passwordReset"),
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    indexes: [
      { fields: ["userId"] },
      { fields: ["token"] },
      { fields: ["expiresAt"] },
    ],
    hooks: {
      beforeCreate: (token) => {
        if (token.type === "passwordReset" && !token.token.startsWith("$")) {
          token.token = crypto.createHash("sha256").update(token.token).digest("hex");
        }
      },
      beforeUpdate: (token) => {
        if (token.changed("token") && token.type === "passwordReset" && !token.token.startsWith("$")) {
          token.token = crypto.createHash("sha256").update(token.token).digest("hex");
        }
      },
    },
  }
);

// Static method to generate token
Token.generateToken = function () {
  return crypto.randomBytes(32).toString("hex");
};

// Instance method to verify token
Token.prototype.verifyToken = function (plainToken) {
  if (this.type === "passwordReset") {
    const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");
    return this.token === hashedToken;
  }
  return this.token === plainToken;
};

export default Token;
