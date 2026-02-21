import {z} from "zod";

export const workspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(50),
});

export const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"], "Invalid role"),
});