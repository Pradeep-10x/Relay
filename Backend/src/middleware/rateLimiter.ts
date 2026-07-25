import { RateLimiterRedis, RateLimiterRes } from "rate-limiter-flexible";
import { redis } from "../lib/redis.js";
import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.js";

const limiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "api-limit",
  points: 100,
  duration: 60
});

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {

    await limiter.consume(req.ip as string);

    next();

  } catch (err) {
    if (err instanceof RateLimiterRes) {
      res.setHeader("Retry-After", Math.ceil(err.msBeforeNext / 1000));

      return res.status(429).json({
        message: "Too many requests"
      });
    }

    logger.warn({ err }, "Rate limiter unavailable, allowing request");
    next();

  }

};
