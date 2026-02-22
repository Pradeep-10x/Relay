import {z} from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
});

export const addMemberSchema = z.object({
    email: z.string().email("Invalid email address"),
    role: z.enum(["ADMIN", "MEMBER"], "Role must be either ADMIN or MEMBER"),
});