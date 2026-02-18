import bcrypt from "bcrypt";

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

export {hashPassword , comparePassword}