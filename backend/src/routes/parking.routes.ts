import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { parkingImageUpload } from "@/middleware/upload";
import {
  listParkingSpots,
  getParkingSpot,
  createParkingSpot,
  verifyParkingSpot,
  reportParkingSpot,
  listVerifications,
} from "@/controllers/parking.controller";
import { bookParkingSpot } from "@/controllers/booking.controller";

const router = Router();

router.get("/", asyncHandler(listParkingSpots));
router.get("/:id", asyncHandler(getParkingSpot));
router.post("/", parkingImageUpload.array("images", 5), asyncHandler(createParkingSpot));
router.post("/:id/verify", asyncHandler(verifyParkingSpot));
router.post("/:id/report", asyncHandler(reportParkingSpot));
router.get("/:id/verifications", asyncHandler(listVerifications));
router.post("/:id/book", asyncHandler(bookParkingSpot));

export default router;
