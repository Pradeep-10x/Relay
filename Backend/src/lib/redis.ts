import { Redis } from "ioredis";
import { logger } from "./logger.js";

export const redis = new Redis(process.env.REDIS_URL!,{
    host: "localhost",
    port: 6379,
    lazyConnect: false,
});

redis.on("connect", () => {
    logger.info("Redis connected");
});
    
redis.on("error", (err) => {
    logger.error(err, "Redis error");
});