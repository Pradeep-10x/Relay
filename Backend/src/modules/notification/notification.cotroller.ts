import { Request, Response } from "express";
import { getUserNotificationsService, markNotificationAsReadService } from "./notification.services.js";

export const getUserNotifications = async (req : Request, res : Response) => {
  const notifications = await getUserNotificationsService((req as any).user.id);
  res.json(notifications);
}

export const markNotificationAsRead = async (req : Request, res : Response) => {
    const {id} = req.params;
    if(!id) {
        return res.status(400).json({ message: "Notification id is required" });
    }
  const notification = await markNotificationAsReadService(id as string, (req as any).user.id);
  res.json(notification);
}
  
  
  