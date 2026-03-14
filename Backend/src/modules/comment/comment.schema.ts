import { z } from "zod";

export const commentParamsSchema = z.object({
  issueId: z.string().min(1, "Issue ID is required").optional(),
  commentId: z.string().min(1, "Comment ID is required").optional(),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(1000),
  issueId: z.string().min(1, "Issue ID is required"),
});

export const editCommentSchema = z.object({
  content: z.string().min(1, "Content is required").max(1000),
});
