import { z } from "zod";

export const getBoardSchema = z.object({
  projectId: z.string().min(1, "Project ID is required").optional(),
});
