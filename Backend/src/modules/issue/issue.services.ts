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
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: issueId },
      select: { id: true, assigneeId: true, version: true },
    });

    if (!issue) {
      throw new ApiError(404, "Issue not found");
    }

    if (issue.assigneeId) {
      throw new ApiError(409, "Issue already assigned");
    }

    const updated = await tx.issue.update({
      where: { id: issue.id, version: issue.version },
      data: {
        assigneeId: userId,
        version: { increment: 1 },
      },
    });

    await tx.issueActiviy.create({
      data: {
        issueId: issue.id,
        userId,
        field: "assignee",
        fromValue: null,
        toValue: userId,
      },
    });

    return updated;
  });
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

export const updateIssueService = async (
  issueId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string | null;
    priority?: IssuePriority;
  }
) => {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        projectId: true,
        title: true,
        description: true,
        priority: true,
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
    });

    if (!membership) {
      throw new ApiError(403, "Not a project member");
    }

    // Build the data object and collect audit entries
    const data: Record<string, any> = {};
    const auditEntries: { field: string; fromValue: string | null; toValue: string | null }[] = [];

    if (updates.title !== undefined && updates.title !== issue.title) {
      data.title = updates.title;
      auditEntries.push({ field: "title", fromValue: issue.title, toValue: updates.title });
    }

    if (updates.description !== undefined && updates.description !== issue.description) {
      data.description = updates.description;
      auditEntries.push({ field: "description", fromValue: issue.description ?? null, toValue: updates.description ?? null });
    }

    if (updates.priority !== undefined && updates.priority !== issue.priority) {
      data.priority = updates.priority;
      auditEntries.push({ field: "priority", fromValue: issue.priority, toValue: updates.priority });
    }

    if (Object.keys(data).length === 0) {
      return issue; // nothing to update
    }

    data.version = { increment: 1 };

    try {
      const updated = await tx.issue.update({
        where: { id: issue.id, version: issue.version },
        data,
      });

      // Create one activity entry per changed field
      for (const entry of auditEntries) {
        await tx.issueActiviy.create({
          data: {
            issueId: issue.id,
            userId,
            field: entry.field,
            fromValue: entry.fromValue,
            toValue: entry.toValue,
          },
        });
      }

      return updated;
    } catch {
      throw new ApiError(409, "Issue was updated by someone else. Please refresh and try again.");
    }
  });
};

export const reassignIssueService = async (
  issueId: string,
  userId: string,
  newAssigneeId: string | null
) => {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        projectId: true,
        assigneeId: true,
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
    });

    if (!membership) {
      throw new ApiError(403, "Not a project member");
    }

    if (newAssigneeId) {
      const assigneeMembership = await tx.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: newAssigneeId,
            projectId: issue.projectId,
          },
        },
      });

      if (!assigneeMembership) {
        throw new ApiError(400, "Assignee must be a project member");
      }
    }

    if (issue.assigneeId === newAssigneeId) {
      return issue; // no change
    }

    try {
      const updated = await tx.issue.update({
        where: { id: issue.id, version: issue.version },
        data: {
          assigneeId: newAssigneeId,
          version: { increment: 1 },
        },
      });

      await tx.issueActiviy.create({
        data: {
          issueId: issue.id,
          userId,
          field: "assignee",
          fromValue: issue.assigneeId ?? null,
          toValue: newAssigneeId ?? null,
        },
      });

      return updated;
    } catch {
      throw new ApiError(409, "Issue was updated by someone else. Please refresh and try again.");
    }
  });
};

export const addIssueDependencyService = async (
  issueId: string,
  userId: string,
  blockerId: string
) => {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: issueId },
      select: { id: true, projectId: true },
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
    });

    if (!membership) {
      throw new ApiError(403, "Not a project member");
    }

    const blockerIssue = await tx.issue.findUnique({
      where: { id: blockerId },
      select: { id: true },
    });

    if (!blockerIssue) {
      throw new ApiError(404, "Blocker issue not found");
    }

    if (issueId === blockerId) {
      throw new ApiError(400, "An issue cannot block itself");
    }

    const existing = await tx.issueDependency.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: issueId,
        },
      },
    });

    if (existing) {
      throw new ApiError(409, "Dependency already exists");
    }

    const dependency = await tx.issueDependency.create({
      data: {
        blockerId,
        blockedId: issueId,
      },
    });

    await tx.issueActiviy.create({
      data: {
        issueId,
        userId,
        field: "dependency_added",
        fromValue: null,
        toValue: blockerId,
      },
    });

    return dependency;
  });
};

export const removeIssueDependencyService = async (
  issueId: string,
  userId: string,
  blockerId: string
) => {
  return prisma.$transaction(async (tx) => {
    const issue = await tx.issue.findUnique({
      where: { id: issueId },
      select: { id: true, projectId: true },
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
    });

    if (!membership) {
      throw new ApiError(403, "Not a project member");
    }

    const dependency = await tx.issueDependency.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId,
          blockedId: issueId,
        },
      },
    });

    if (!dependency) {
      throw new ApiError(404, "Dependency not found");
    }

    await tx.issueDependency.delete({
      where: { id: dependency.id },
    });

    await tx.issueActiviy.create({
      data: {
        issueId,
        userId,
        field: "dependency_removed",
        fromValue: blockerId,
        toValue: null,
      },
    });

    return { success: true };
  });
};

export const getIssueActivityService = async (issueId: string) => {
  const issue = await prisma.issue.findUnique({
    where: { id: issueId },
    select: { id: true },
  });

  if (!issue) {
    throw new ApiError(404, "Issue not found");
  }

  return prisma.issueActiviy.findMany({
    where: { issueId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  });
};