import { ErrorHandler } from "../utils/errorHandler.js";
import process from 'process';

export const errorHandlerMiddleware = (err, req, res, next) => {
  // Default error message and status code
  err.message = err.message || "Internal server error";
  err.statusCode = err.statusCode || 500;

  // Log the error (could be improved with a logging service)
  console.error(`Error: ${err.message}`);
  
  // Send the response
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    // Optionally include the stack trace in non-production environments
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const handleUncaughtError = () => {
  // Handle uncaught exceptions
  process.on("uncaughtException", (err) => {
    console.error(`Uncaught Exception: ${err.message}`);
    console.error(err.stack);
    console.log("Shutting down server due to uncaught exception...");

    // Optional: Gracefully shut down server here
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    console.error(err.stack);
    console.log("Shutting down server due to unhandled rejection...");

    // Optional: Gracefully shut down server here
    process.exit(1);
  });
};
