import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ["password"] },
      });
      
      if (user && user.isBlocked) {
        return res.status(403).json({
          success: false,
          error: { message: "Account has been blocked", code: 403 },
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: { message: "Not authorized, token failed", code: 401 },
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: "Not authorized, no token", code: 401 },
    });
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authorized", code: 401 },
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { message: "Access denied", code: 403 },
      });
    }
    next();
  };
};
