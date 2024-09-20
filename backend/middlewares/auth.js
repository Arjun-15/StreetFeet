import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import UserModel from "../src/user/models/user.schema.js";

export const auth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler(401, "Login to access this route!"));
  }

  try {
    // Verify token and get the decoded data
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user by ID from the decoded token
    req.user = await UserModel.findById(decodedData.id);
    if (!req.user) {
      return next(new ErrorHandler(401, "User not found!"));
    }
    next();
  } catch (error) {
    return next(new ErrorHandler(401, "Invalid or expired token!"));
  }
};

export const authByUserRole = (...roles) => {
  return async (req, res, next) => {
    // Ensure req.user is populated
    if (!req.user) {
      return next(new ErrorHandler(401, "User not authenticated"));
    }

    // Check if the user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          403,
          `Role: ${req.user.role} is not allowed to access this resource`
        )
      );
    }

    next();
  };
};