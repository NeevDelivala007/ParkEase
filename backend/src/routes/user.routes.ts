import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { createUser, listUsers } from "@/controllers/user.controller";

const router = Router();

router.get("/", asyncHandler(listUsers));
router.post("/", asyncHandler(createUser));

export default router;
