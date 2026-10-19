import { z } from "zod";

export const parkingTypeEnum = z.enum(["PUBLIC", "PRIVATE", "COMMUNITY"]);

const timeString = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Expected 24-hour time in HH:MM format")
  .optional();

/**
 * Multipart form fields arrive as strings, so numeric fields use
 * z.coerce.number() — this schema works whether the request is
 * multipart/form-data (with images) or a plain JSON body (no images).
 */
export const createParkingSpotSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required"),
    description: z.string().trim().max(1000).optional(),
    type: parkingTypeEnum,
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    address: z.string().trim().optional(),
    totalCapacity: z.coerce.number().int().positive().optional(),
    availableCapacity: z.coerce.number().int().min(0).optional(),
    pricePerHour: z.coerce.number().min(0).optional(),
    openingTime: timeString,
    closingTime: timeString,
    // Required for COMMUNITY submissions (see .refine below). No auth yet,
    // so the submitting user's id is passed explicitly by the client.
    submittedById: z.string().cuid("submittedById must be a valid user id").optional(),
  })
  .refine((data) => data.type !== "COMMUNITY" || !!data.submittedById, {
    message: "submittedById is required when type is COMMUNITY",
    path: ["submittedById"],
  })
  .refine(
    (data) =>
      data.totalCapacity === undefined ||
      data.availableCapacity === undefined ||
      data.availableCapacity <= data.totalCapacity,
    {
      message: "availableCapacity cannot exceed totalCapacity",
      path: ["availableCapacity"],
    }
  );

export type CreateParkingSpotInput = z.infer<typeof createParkingSpotSchema>;

/**
 * Fixed report-reason set from the product brief. There's no dedicated
 * `reason` column on the Verification model at this stage — the label is
 * folded into `comment` (see parking.service.ts) to keep the schema lean.
 */
export const reportReasons = [
  "NO_LONGER_AVAILABLE",
  "PRIVATE_OR_RESTRICTED",
  "NO_PARKING_ALLOWED",
  "WRONG_LOCATION",
  "UNSAFE",
  "DUPLICATE",
] as const;

export const reportReasonLabels: Record<(typeof reportReasons)[number], string> = {
  NO_LONGER_AVAILABLE: "No longer available",
  PRIVATE_OR_RESTRICTED: "Private/restricted",
  NO_PARKING_ALLOWED: "No parking allowed",
  WRONG_LOCATION: "Wrong location",
  UNSAFE: "Unsafe",
  DUPLICATE: "Duplicate",
};

export const verifyParkingSpotSchema = z.object({
  userId: z.string().cuid("A valid userId is required"),
  comment: z.string().trim().max(500).optional(),
});
export type VerifyParkingSpotInput = z.infer<typeof verifyParkingSpotSchema>;

export const reportParkingSpotSchema = z.object({
  userId: z.string().cuid("A valid userId is required"),
  reason: z.enum(reportReasons),
  comment: z.string().trim().max(500).optional(),
});
export type ReportParkingSpotInput = z.infer<typeof reportParkingSpotSchema>;

export const bookParkingSpotSchema = z
  .object({
    userId: z.string().cuid("A valid userId is required"),
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });
export type BookParkingSpotInput = z.infer<typeof bookParkingSpotSchema>;
