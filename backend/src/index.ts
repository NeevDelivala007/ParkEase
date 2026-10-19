import { createApp } from "@/app";
import { env } from "@/config/env";
import { prisma } from "@/lib/prisma";

const app = createApp();

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`🚗 ParkEase API listening on http://localhost:${env.PORT}`);
  // eslint-disable-next-line no-console
  console.log(`   Health check: http://localhost:${env.PORT}/api/health`);
});

async function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
