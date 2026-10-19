import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import apiRouter from "@/routes";
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";
import { corsOrigins, isDevelopment } from "@/config/env";

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS — restricted to the configured frontend origin(s)
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: "5mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(morgan(isDevelopment ? "dev" : "combined"));

  // Static file serving for locally-stored uploads (dev fallback when
  // IMAGE_STORAGE_PROVIDER=local instead of Cloudinary)
  app.use("/uploads", express.static("uploads"));

  // API routes
  app.use("/api", apiRouter);

  // Root
  app.get("/", (_req, res) => {
    res.json({
      success: true,
      data: {
        name: "ParkEase API",
        message: "Find parking. Discover parking.",
        docs: "/api/health",
      },
    });
  });

  // 404 + centralized error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
