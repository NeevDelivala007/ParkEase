import { Request, Response } from "express";
import * as userService from "@/services/user.service";
import { createUserSchema } from "@/validators/user.validators";

export async function createUser(req: Request, res: Response) {
  const input = createUserSchema.parse(req.body);
  const user = await userService.createUser(input);
  res.status(201).json({ success: true, data: user });
}

export async function listUsers(_req: Request, res: Response) {
  const users = await userService.listUsers();
  res.json({ success: true, data: users });
}
