import { RateLimiterRedis } from "rate-limiter-flexible";
import { redis } from "../lib/redis.js";
import { Request, Response, NextFunction } from "express";

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

  } catch {

    res.status(429).json({
      message: "Too many requests"
    });

  }

};