import multer from "multer";
import { AppError } from "@/lib/AppError";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB per image
const MAX_FILES = 5;

/**
 * In-memory storage: files are handed to `saveParkingImage` as a Buffer,
 * which decides where they actually end up (see lib/imageStorage.ts).
 * Keeps this middleware agnostic to local-vs-cloud storage.
 */
export const parkingImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES, files: MAX_FILES },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(AppError.badRequest("Only image files are allowed"));
      return;
    }
    callback(null, true);
  },
});
