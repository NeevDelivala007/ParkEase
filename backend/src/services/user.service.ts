import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/AppError";
import type { CreateUserInput } from "@/validators/user.validators";

/**
 * POST /api/users
 *
 * Idempotent-ish: if the email already exists, returns that existing user
 * rather than erroring, since the frontend may retry creating its local
 * "demo identity" (e.g. after clearing localStorage) with the same
 * generated email.
 */
export async function createUser(input: CreateUserInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return existing;

  return prisma.user.create({ data: { name: input.name, email: input.email } });
}

/** GET /api/users — lists demo identities so the frontend can offer switching between them. */
export async function listUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: "asc" } });
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw AppError.notFound("User not found");
  return user;
}
