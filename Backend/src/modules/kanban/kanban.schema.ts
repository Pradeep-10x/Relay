import { z } from "zod";

export const getKanbanSchema = z.object({
  projectId: z.string().min(1, "Project ID is required").optional(),
});
