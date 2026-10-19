import fs from "fs";
import path from "path";
import crypto from "crypto";
import { env } from "@/config/env";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "parking");

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Persists an uploaded parking photo and returns the URL the frontend can
 * render it from.
 *
 * Only the "local" provider is actually wired up right now: it writes the
 * file to disk under backend/uploads/parking and serves it via the
 * `/uploads` static route already mounted in app.ts. IMAGE_STORAGE_PROVIDER
 * can be set to "cloudinary", but the Cloudinary SDK isn't installed or
 * wired up yet — rather than pretend that path works, it logs a warning
 * and falls back to local storage.
 */
export async function saveParkingImage(file: Express.Multer.File): Promise<string> {
  if (env.IMAGE_STORAGE_PROVIDER === "cloudinary") {
    // eslint-disable-next-line no-console
    console.warn(
      "[imageStorage] IMAGE_STORAGE_PROVIDER=cloudinary but the Cloudinary SDK is not wired up yet — falling back to local disk storage."
    );
  }

  ensureUploadDir();
  const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
  const filename = `${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), file.buffer);

  return `/uploads/parking/${filename}`;
}
