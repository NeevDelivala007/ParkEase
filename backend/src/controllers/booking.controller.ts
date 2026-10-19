import { Request, Response } from "express";
import * as bookingService from "@/services/booking.service";
import { bookParkingSpotSchema } from "@/validators/parking.validators";

export async function bookParkingSpot(req: Request, res: Response) {
  const input = bookParkingSpotSchema.parse(req.body);
  const booking = await bookingService.createBooking(req.params.id, input.userId, input.startTime, input.endTime);
  res.status(201).json({ success: true, data: booking });
}

export async function listBookings(req: Request, res: Response) {
  const userId = typeof req.query.userId === "string" ? req.query.userId : undefined;
  const bookings = await bookingService.listBookings(userId);
  res.json({ success: true, data: bookings });
}

export async function cancelBooking(req: Request, res: Response) {
  const booking = await bookingService.cancelBooking(req.params.id);
  res.json({ success: true, data: booking });
}
