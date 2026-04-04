import { z } from "zod";

export const issueParamsSchema = z.object({
  projectId: z.string().min(1, "Project ID is required").optional(),
  issueId: z.string().min(1, "Issue ID is required").optional(),
  blockerId: z.string().min(1, "Blocker ID is required").optional(),
});

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateIssueStateSchema = z.object({
  targetStateId: z.string().min(1, "Target State ID is required"),
});

export const addDependencySchema = z.object({
  blockerId: z.string().min(1, "Blocker ID is required"),
});

export const updateIssueSchema = z.object({
  title: z.string().min(1, "Title is required").max(100).optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
});
