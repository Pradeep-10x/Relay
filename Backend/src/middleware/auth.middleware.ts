import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization; 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No authorization header or invalid format" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token) as { sub: string, name?: string, email?: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized payload" });
    }
     
    // Stateless Auth: Extract user directly from JWT payload
    req.user = {
      id: payload.sub,
      name: payload.name || "Unknown",
      email: payload.email || "unknown@domain.com"
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
    