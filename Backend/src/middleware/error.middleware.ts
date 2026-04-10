import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ApiError } from "../utils/ApiError.js";
import { ZodError } from "zod";
import { logger } from "../lib/logger.js";

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.issues.map((e: any) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    });
  }

  // Known API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: "Unique constraint failed. A record with this value already exists.",
        errors: [{ field: err.meta?.target || "database", message: "Duplicate value" }],
      });
    }
    return res.status(400).json({
      success: false,
      message: "Database operation failed",
    });
  }

  // Unknown errors — don't leak internals
  logger.error({ err, path: req.path, method: req.method }, "Unhandled error");

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
