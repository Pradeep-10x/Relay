import app from "./app.js";
import { env } from "./config/env.js";
import { prisma,connectDB } from "./lib/prisma.js";
import { logger } from "./config/logger.js";
import http from "http";
import { initSocket } from "./lib/socket.js";
import { initOverdueCron } from "./cron/overdueIssues.cron.js";
import { redis } from "./lib/redis.js";

async function startServer() {
  try {
    await connectDB();
    logger.info("Database connected");

    const server = http.createServer(app);
    initSocket(server);
    initOverdueCron();
    
    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received — shutting down gracefully…`);

      server.close(async () => {
        logger.info("HTTP server closed");

        try {
          await prisma.$disconnect();
          logger.info("Prisma disconnected");
        } catch (e) {
          logger.error(e, "Error disconnecting Prisma");
        }

        try {
          redis.disconnect();
          logger.info("Redis disconnected");
        } catch (e) {
          logger.error(e, "Error disconnecting Redis");
        }

        process.exit(0);
      });

      // Force exit after 10s if graceful shutdown stalls
      setTimeout(() => {
        logger.error("Graceful shutdown timed out — forcing exit");
        process.exit(1);
      }, 10_000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
startServer();