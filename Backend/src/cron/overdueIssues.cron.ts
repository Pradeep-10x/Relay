import cron from "node-cron";
import { prisma } from "../lib/prisma.js";
import { createNotificationService } from "../modules/notification/notification.services.js";
import { logger } from "../config/logger.js";

// Run every hour at minute 0
export const initOverdueCron = () => {
    cron.schedule("0 * * * *", async () => {
        try {
            logger.info("[CRON] Scanning for overdue issues...");
            const now = new Date();

            const overdueIssues = await prisma.issue.findMany({
                where: {
                    dueDate: { lt: now },
                    isOverdueNotified: false,
                    isDeleted: false,
                    state: {
                        name: { notIn: ["DONE", "RESOLVED", "COMPLETED"] }
                    }
                },
                include: {
                    project: {
                        include: {
                            members: {
                                where: { role: { in: ["ADMIN", "OWNER"] } }
                            }
                        }
                    }
                }
            });

            if (overdueIssues.length === 0) return;

            logger.info(`[CRON] Found ${overdueIssues.length} overdue issues. Processing notifications...`);

            for (const issue of overdueIssues) {
                // 1. Notify Assignee
                if (issue.assigneeId) {
                    await createNotificationService(issue.assigneeId, "ISSUE_OVERDUE", issue.id);
                }

                // 2. Notify Project Admins/Owners
                for (const member of issue.project.members) {
                    // Prevent duplicate notification if assignee is also an admin
                    if (member.userId !== issue.assigneeId) {
                        await createNotificationService(member.userId, "ISSUE_OVERDUE", issue.id);
                    }
                }

                // 3. Mark as notified so we don't spam them on the next run
                await prisma.issue.update({
                    where: { id: issue.id },
                    data: { isOverdueNotified: true }
                });
            }
        } catch (error) {
            logger.error({ err: error }, "[CRON] Scheduled task execution failed");
        }
    });

    logger.info("[CRON] Overdue issues scanner initialized");
};
