import { z } from "zod";

/**
 * No authentication exists yet (see backend README). This is the same
 * lean User shape from Stage 2 — just enough to attribute submissions,
 * verifications, reports and bookings to *someone*. Creating a user here
 * requires no password and issues no session/token.
 */
export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
