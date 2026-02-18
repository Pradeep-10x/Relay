import { z } from "zod";

 const registerSchema = z.object({
  email: z.string().toLowerCase().email("Invalid email"),
  password: z.string().min(8),
  name: z.string(),
});

 const loginSchema = z.object({
  email: z.string().email(),
  password:  z.string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export {registerSchema,loginSchema}
