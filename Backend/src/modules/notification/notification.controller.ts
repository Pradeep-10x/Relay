import { Request, Response } from "express";
import { getUserNotificationsService, markNotificationAsReadService } from "./notification.services.js";
import { notificationParamsSchema } from "./notification.schema.js";

export const getUserNotifications = async (req : Request, res : Response) => {
  const notifications = await getUserNotificationsService((req as any).user.id);
  res.json(notifications);
}

export const markNotificationAsRead = async (req : Request, res : Response) => {
    const { id } = notificationParamsSchema.parse(req.params);

  const notification = await markNotificationAsReadService(id as string, (req as any).user.id);
  res.json(notification);
}
  
  
  