import "dotenv/config";
import { z } from "zod";

/**
 * All environment variables are validated once, at startup, so the app
 * fails fast with a clear error instead of crashing later with an
 * `undefined` deep inside some unrelated module.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  IMAGE_STORAGE_PROVIDER: z.enum(["cloudinary", "local"]).default("local"),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error("❌ Invalid environment configuration:");
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }

  return parsed.data;
}

export const env = loadEnv();

export const isProduction = env.NODE_ENV === "production";
export const isDevelopment = env.NODE_ENV === "development";

/** CORS_ORIGIN may be a comma-separated list; normalize to an array. */
export const corsOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim());
