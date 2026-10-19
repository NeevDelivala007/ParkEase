import { Router } from "express";
import healthRoutes from "@/routes/health.routes";
import parkingRoutes from "@/routes/parking.routes";
import bookingRoutes from "@/routes/booking.routes";
import userRoutes from "@/routes/user.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/parking", parkingRoutes);
router.use("/bookings", bookingRoutes);
router.use("/users", userRoutes);

export default router;
