import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  refreshTokens

  
} from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import { prisma } from "../../lib/prisma.js";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.parse(req.body);
  const {accessToken, refreshToken} = await registerUser(parsed);
  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(201)
    .json({ message : "User registered successfully", accessToken });
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.parse(req.body);
  const tokens = await loginUser(parsed);
  res
    .cookie("refreshToken", tokens.refreshToken)
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // })
    .status(200)
    .json({ message: "User logged in successfully", accessToken: tokens.accessToken });
}

export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const tokens = await refreshTokens(refreshToken);

  res
    .cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ accessToken: tokens.accessToken });
}

export async function logout(req: Request, res: Response) {
    
   const rT= req.cookies?.refreshToken;
   if(!rT){
    return res.status(400).json({ message: "No refresh token provided" });
   }
    await prisma.refreshToken.updateMany({
      where: { userId: (req as any).user.id },
      data: { revoked: true },
    });
     

  res.clearCookie("refreshToken")

  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  res.json({ user: (req as any).user });
}