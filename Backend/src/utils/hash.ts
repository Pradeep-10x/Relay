import bcrypt from "bcrypt";
import { createHash } from "crypto";

const SALT_ROUNDS = 12;

const hashPassword=async(password: string) => {
  return bcrypt.hash(password, SALT_ROUNDS);
}

const comparePassword= async(
  password: string,
  hash: string
) =>{
  return bcrypt.compare(password, hash);
}

// Deterministic hash for refresh tokens so they can be looked up by value
// while never being stored in plaintext. Must be deterministic (no salt).
const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export {hashPassword , comparePassword, hashToken}