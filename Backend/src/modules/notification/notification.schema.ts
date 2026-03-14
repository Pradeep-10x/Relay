import { z } from "zod";

export const notificationParamsSchema = z.object({
  id: z.string().min(1, "Notification ID is required").optional(),
});
