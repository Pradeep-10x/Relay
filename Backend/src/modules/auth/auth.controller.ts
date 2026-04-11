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
  const { user , accessToken, refreshToken} = await registerUser(parsed);
  res
    .cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(201)
    .json({ message : "User registered successfully", accessToken , "user" : user});
}

export async function login(req: Request, res: Response) {
  const parsed = loginSchema.parse(req.body);
  const tokens = await loginUser(parsed);
  res
    .cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
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
      where: { token: rT },
      data: { revoked: true },
    });
     

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.json({ message: "Logged out" });
}

export async function me(req: Request, res: Response) {
  res.json({ user: req.user! });
}

export async function googleAuth(req: Request, res: Response) {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";

  const options = new URLSearchParams({
    redirect_uri: redirectUri as string,
    client_id: clientId as string,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  });

  res.redirect(`${rootUrl}?${options.toString()}`);
}

export async function googleAuthCallback(req: Request, res: Response) {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ message: "Authorization code not provided" });
    }

    const { googleCallbackService } = await import("./auth.service.js");
    const tokens = await googleCallbackService(code);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
    res.redirect(`${clientOrigin}/auth/callback?token=${tokens.accessToken}`);
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
    res.redirect(`${clientOrigin}/auth?error=GoogleAuthFailed`);
  }
}
