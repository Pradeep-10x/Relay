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
                // Notify assignee + project admins/owners, de-duplicating recipients.
                const recipientIds = new Set<string>();
                if (issue.assigneeId) recipientIds.add(issue.assigneeId);
                for (const member of issue.project.members) {
                    recipientIds.add(member.userId);
                }

                await Promise.all(
                    [...recipientIds].map((userId) =>
                        createNotificationService(userId, "ISSUE_OVERDUE", issue.id)
                    )
                );
            }

            // Mark everything processed in one statement so the next run skips them.
            await prisma.issue.updateMany({
                where: { id: { in: overdueIssues.map((i) => i.id) } },
                data: { isOverdueNotified: true },
            });
        } catch (error) {
            logger.error({ err: error }, "[CRON] Scheduled task execution failed");
        }
    });

    logger.info("[CRON] Overdue issues scanner initialized");
};
