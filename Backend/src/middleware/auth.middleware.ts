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

    const payload = verifyAccessToken(token) as { sub: string };

    if (!payload?.sub) {
      return res.status(401).json({ message: "Unauthorized payload" });
    }
     
    //Fetching user from db
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        name: true,
        id: true,
        email: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    
    (req as any).user =  user;

    next();
  } catch (error) {
    return res.status(401).json({ message: error });
  }
}
    