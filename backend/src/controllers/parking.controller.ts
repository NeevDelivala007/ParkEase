import { Request, Response } from "express";
import * as parkingService from "@/services/parking.service";
import { saveParkingImage } from "@/lib/imageStorage";
import {
  createParkingSpotSchema,
  verifyParkingSpotSchema,
  reportParkingSpotSchema,
} from "@/validators/parking.validators";

export async function listParkingSpots(_req: Request, res: Response) {
  const spots = await parkingService.listParkingSpots();
  res.json({ success: true, data: spots });
}

export async function getParkingSpot(req: Request, res: Response) {
  const spot = await parkingService.getParkingSpotById(req.params.id);
  res.json({ success: true, data: spot });
}

export async function createParkingSpot(req: Request, res: Response) {
  const input = createParkingSpotSchema.parse(req.body);

  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const imageUrls = await Promise.all(files.map((file) => saveParkingImage(file)));

  const spot = await parkingService.createParkingSpot(input, imageUrls);
  res.status(201).json({ success: true, data: spot });
}

export async function verifyParkingSpot(req: Request, res: Response) {
  const input = verifyParkingSpotSchema.parse(req.body);
  const result = await parkingService.verifyParkingSpot(req.params.id, input.userId, input.comment);
  res.json({ success: true, data: result });
}

export async function reportParkingSpot(req: Request, res: Response) {
  const input = reportParkingSpotSchema.parse(req.body);
  const result = await parkingService.reportParkingSpot(req.params.id, input.userId, input.reason, input.comment);
  res.json({ success: true, data: result });
}

export async function listVerifications(req: Request, res: Response) {
  const result = await parkingService.listVerifications(req.params.id);
  res.json({ success: true, data: result });
}
