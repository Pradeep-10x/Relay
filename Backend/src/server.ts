import app from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { logger } from "./config/logger.js";

async function startServer() {
  try {
    await prisma.$connect();
    logger.info("Database connected");

    app.listen(env.PORT, () => {
      logger.info(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
}

startServer();
