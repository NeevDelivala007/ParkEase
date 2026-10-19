import { PrismaClient } from "@prisma/client";
import { isDevelopment } from "@/config/env";

/**
 * A single, shared PrismaClient instance.
 *
 * In dev, `tsx watch` re-executes the module on every file change, which
 * would otherwise create a fresh PrismaClient (and a fresh pool of DB
 * connections) on every reload. Stashing it on `globalThis` avoids that.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: isDevelopment ? ["warn", "error"] : ["error"],
  });

if (isDevelopment) {
  global.__prisma = prisma;
}
