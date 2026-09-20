import app from "./app.js";
import { env } from "./config/env.js";
import { prisma,connectDB } from "./lib/prisma.js";
import { logger } from "./config/logger.js";
import http from "http";
import { initSocket } from "./lib/socket.js";
import { getIo } from "./lib/socket.js";
import { redis } from "./lib/redis.js";
import { initOverdueCron } from "./cron/overdueIssues.cron.js";

async function startServer() {
  try {
    await connectDB();
    logger.info("Database connected");

    const server = http.createServer(app);
    initSocket(server);

    // Start the scheduled scanner for overdue issues.
    initOverdueCron();

    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

    setupGracefulShutdown(server);

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

function setupGracefulShutdown(server: http.Server) {
  let shuttingDown = false;

  const shutdown = async (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Shutting down gracefully...");

    // Stop accepting new HTTP connections.
    server.close(() => logger.info("HTTP server closed"));

    try {
      getIo().close();
    } catch {
      // socket may not be initialised
    }

    try {
      await prisma.$disconnect();
      logger.info("Database disconnected");
    } catch (err) {
      logger.error({ err }, "Error disconnecting database");
    }

    try {
      redis.disconnect();
    } catch {
      // ignore
    }

    // Give in-flight work a moment, then exit.
    setTimeout(() => process.exit(0), 1000).unref();
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error({ reason }, "Unhandled promise rejection");
  });
  process.on("uncaughtException", (err) => {
    logger.error({ err }, "Uncaught exception");
  });
}

startServer();