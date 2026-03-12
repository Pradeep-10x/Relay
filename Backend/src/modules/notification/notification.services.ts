import { string } from "zod";
import { prisma } from "../../lib/prisma.js";
import { NotificationType } from "@prisma/client";

export const createNotificationService = async (
  userId : string,
  type : NotificationType,
  issueId? : string,
  commentId? : string) => {
  return prisma.notification.create({
    data: {
      userId,
      type,
      issueId: issueId ?? null,
      commentId: commentId ?? null,
    },
  });
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
            
  