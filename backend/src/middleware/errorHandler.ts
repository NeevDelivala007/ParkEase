import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import multer from "multer";
import { Prisma } from "@prisma/client";
import { AppError } from "@/lib/AppError";
import { isDevelopment } from "@/config/env";

/** 404 handler — mounted after all routes. */
export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
    },
  });
}

/**
 * Single place where every error in the app ends up. Keeps API error
 * responses consistent: { success: false, error: { message, details? } }
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Validation failed",
        details: err.flatten(),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "Each image must be 5MB or smaller"
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Too many images — up to 5 are allowed"
          : "Image upload failed";
    return res.status(400).json({ success: false, error: { message } });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: { message: "A record with that value already exists" },
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: { message: "Resource not found" },
      });
    }
  }

  // Unexpected error — log the full thing server-side, but don't leak
  // internals to the client in production.
  // eslint-disable-next-line no-console
  console.error("Unhandled error:", err);

  const message = err instanceof Error ? err.message : "Internal server error";

  return res.status(500).json({
    success: false,
    error: {
      message: isDevelopment ? message : "Internal server error",
      ...(isDevelopment && err instanceof Error ? { stack: err.stack } : {}),
    },
  });
}
