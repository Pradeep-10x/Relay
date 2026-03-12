import { string } from "zod";
import { prisma } from "../../lib/prisma.js";
import { NotificationType } from "@prisma/client";

export const createNotification = async (
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