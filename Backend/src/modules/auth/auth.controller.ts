import { Request, Response } from "express";
import {
  registerUser,
  
} from "./auth.service.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

export async function register(req: Request, res: Response) {
  const parsed = registerSchema.parse(req.body);
  const {accessToken, refreshToken} = await registerUser(parsed);
  res.status(201).json({accessToken, refreshToken});
}



