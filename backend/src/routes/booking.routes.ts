import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { listBookings, cancelBooking } from "@/controllers/booking.controller";

const router = Router();

router.get("/", asyncHandler(listBookings));
router.put("/:id/cancel", asyncHandler(cancelBooking));

export default router;
