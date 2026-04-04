
import { prisma } from "../../lib/prisma.js";
import { NotificationType } from "@prisma/client";
import { getIo } from "../../lib/socket.js";

export const createNotificationService = async (
  userId : string,
  type : NotificationType,
  issueId? : string,
  commentId? : string) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      issueId: issueId ?? null,
      commentId: commentId ?? null,
    },
  });

  const io = getIo();
  io.to(userId).emit("notification", notification);
  return notification;
};

export const getUserNotificationsService = async (
  userId : string) => {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        issue: {
          select: {
            id: true,
            title: true,
          }
        },
        comment: true
      }
    })
  }
            
export const markNotificationAsReadService = async (
  notificationId : string,
  userId : string) => {
    return prisma.notification.update({
      where: { id: notificationId, userId },
      data: { read: true },
    })
  }
    