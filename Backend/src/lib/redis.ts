import { Redis } from "ioredis";
import { logger } from "./logger.js";

export const redis = new Redis({
    host: "localhost",
    port: 6379,
});

redis.on("connect", () => {
    logger.info("Redis connected");
});
    
redis.on("error", (err) => {
    logger.error(err, "Redis error");
});