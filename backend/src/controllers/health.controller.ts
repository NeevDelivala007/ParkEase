import { Request, Response } from "express";
import { prisma } from "@/lib/prisma";

/**
 * Basic liveness check — always returns 200 if the process is up.
 * Does NOT touch the database, so it stays fast and reliable even if the
 * DB is briefly unavailable.
 */
export async function getHealth(_req: Request, res: Response) {
  res.status(200).json({
    success: true,
    data: {
      status: "ok",
      service: "parkease-backend",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
    },
  });
}

/**
 * Readiness check — also verifies the database connection. Useful for
 * confirming the Prisma + PostgreSQL wiring actually works end to end.
 */
export async function getReadiness(_req: Request, res: Response) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      success: true,
      data: { status: "ok", database: "connected" },
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        message: "Database not reachable",
        detail: error instanceof Error ? error.message : String(error),
      },
    });
  }
}
