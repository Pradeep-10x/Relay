import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { prisma } from "../lib/prisma.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization || req.cookies;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = header.split(" ")[1];

  try {
    const payload =  await verifyAccessToken(token) as { sub: string };

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}
