import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const generateAccessToken= (user: { id: string, name: string, email: string })=> {
  return jwt.sign(
    { sub: user.id, name: user.name, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { sub: userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: "15d"}
  );
};

const  verifyAccessToken =  (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

const verifyRefreshToken= (token: string) =>{
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
}

export {generateAccessToken,generateRefreshToken,verifyAccessToken,verifyRefreshToken}