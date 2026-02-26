import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { IssuePriority } from "@prisma/client";

export const createIssueService = async (
  projectId: string,
  userId: string,
  title: string,
  priority: IssuePriority,
  description?: string,
   assigneeId?: string
) => {
  return prisma.$transaction(async (tx) => {

    const membership = await tx.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (!membership) {
      throw new ApiError(403, "Not a member of this project");
    }

    const openState = await tx.workflowState.findFirst({
      where: {
        projectId,
        name: "OPEN",
      },
    });

    if (!openState) {
      throw new ApiError(500, "Default OPEN state not found");
    }

    
    if (assigneeId) {
      const assigneeMembership = await tx.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: assigneeId,
            projectId,
          },
        },
      });

      if (!assigneeMembership) {
        throw new ApiError(400, "Assignee must be a project member");
      }
    }
    const updatedProject = await tx.project.update({
      where: { id: projectId },
      data: {
        issueCounter: { increment: 1 },
      },
    });

    const issueKey = `${updatedProject.key}-${updatedProject.issueCounter}`;

    const issue = await tx.issue.create({
      data: {
        key : issueKey,
        title,
        description : description ?? null,
        priority,
        projectId,
        reporterId: userId,
        assigneeId: assigneeId ?? null,
        stateId: openState.id,
        version: 1,
      },
    });

    return issue;
  });
};