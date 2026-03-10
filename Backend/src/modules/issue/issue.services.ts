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

export const selfAssignIssueService = async (
  issueId: string,
  userId: string
) => {

  const result = await prisma.issue.updateMany({
    where: {
      id: issueId,
      assigneeId: null,
    },
    data: {
      assigneeId: userId,
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    throw new ApiError(409, "Issue already assigned");
  }

  return { success: true };
};

export const updateIssueStateService = async (
  issueId: string,
  userId: string,
  targetStateId: string
) => {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        projectId: true,
        stateId: true,
        version: true,
      },
    });

    if (!issue) {
      throw new ApiError(404, "Issue not found");
    }

    const membership = await tx.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId: issue.projectId,
        },
      },
      select: { role: true },
    });

    if (!membership) {
      throw new ApiError(403, "Not a project member");
    }

    if (issue.stateId === targetStateId) {
      throw new ApiError(400, "Issue already in this state");
    }

    const transition = await tx.workflowTransition.findFirst({
      where: {
        projectId: issue.projectId,
        fromStateId: issue.stateId,
        toStateId: targetStateId,
      },
      select: { allowedRoles: true },
    });

    if (!transition) {
      throw new ApiError(400, "Invalid state transition");
    }

    if (
      !transition.allowedRoles.includes(membership.role) &&
      membership.role !== "OWNER"
    ) {
      throw new ApiError(403, "You are not allowed to perform this transition");
    }

    const targetState = await tx.workflowState.findUnique({
      where: { id: targetStateId },
      select: { name: true },
    });

    if (!targetState) {
      throw new ApiError(404, "Target state not found");
    }

  

const doneState = await tx.workflowState.findFirst({
  where: {
    projectId: issue.projectId,
    name: "DONE",
  },
  select: { id: true },
});

if (!doneState) {
  throw new ApiError(500, "DONE state not configured");
}

const unresolvedBlockers = await tx.issueDependency.findFirst({
  where: {
    blockedId: issue.id, 
    blocker: {
      stateId: {
        not: doneState.id,
      },
    },
  },
});

if (unresolvedBlockers) {
  throw new ApiError(
    400,
    "Cannot move to DONE while blockers are unresolved"
  );
}

    
    try {
      const updated = await tx.issue.update({
        where: {
          id: issue.id,
          version: issue.version,
        },
        data: {
          stateId: targetStateId,
          version: { increment: 1 },
        },
      });

      await tx.issueActiviy.create({
        data: {
          issueId: issue.id,
          userId,
          field: "state",
           fromValue: issue.stateId,
             toValue: targetStateId,
        },
      });

      return updated;
    } catch (error) {
      // version mismatch = concurrent update
      throw new ApiError(
        409,
        "Issue was updated by someone else. Please refresh and try again."
      );
    }
  });
};