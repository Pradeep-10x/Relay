import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./config/logger.js";
import http from "http";
import { initSocket } from "./lib/socket.js";

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    const server = http.createServer(app);
    initSocket(server);
    server.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });

  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}
startServer();