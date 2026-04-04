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

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
startServer();