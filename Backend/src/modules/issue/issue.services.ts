import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { IssuePriority } from "@prisma/client";
import { createNotificationService } from "../notification/notification.services.js";
import { NotificationType } from "@prisma/client";
import { getCache, setCache , deleteCache } from "../../utils/cache.js";
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
    await deleteCache(`board:${projectId}`);
    await deleteCache(`analytics:${projectId}`);
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

      await tx.issueActivity.create({
        data: {
          issueId: issue.id,
          userId,
          field: "state",
           fromValue: issue.stateId,
             toValue: targetStateId,
        },
      });
       await deleteCache(`board:${issue.projectId}`);
    await deleteCache(`analytics:${issue.projectId}`);
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

    await tx.issueActivity.create({
      data: {
        issueId,
        userId,
        field: "dependency_added",
        fromValue: null,
        toValue: blockerId,
      },
    });
    await deleteCache(`board:${issue.projectId}`);
    await deleteCache(`analytics:${issue.projectId}`);
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

    await tx.issueActivity.create({
      data: {
        issueId,
        userId,
        field: "dependency_removed",
        fromValue: blockerId,
        toValue: null,
      },
    });
    await deleteCache(`board:${issue.projectId}`);
    await deleteCache(`analytics:${issue.projectId}`);
    return { success: true };
  });
};

export const getIssueActivityService = async (
  issueId : string,
  userId : string) => {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
       select: {
        projectId: true
       }
    })
    if(!issue) {
      throw new ApiError(404, "Issue not found");
    }
    const membership = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId, projectId: issue.projectId } },
    })
    if(!membership) {
      throw new ApiError(403, "User is not a member of this project");
    }
    return prisma.issueActivity.findMany({
      where: { issueId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            avatar: true,
          }
        }
      }
    })
  } 

export const updateIssueService = async (
  issueId: string,
  userId: string,
  data: {
    title?: string;
    description?: string;
    priority?: IssuePriority;
    assigneeId?: string | null;
  }
) => {
  return prisma.$transaction(async (tx) => {

    const issue = await tx.issue.findUnique({
      where: { id: issueId },
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

    const isPrivileged =
      membership.role === "ADMIN" || membership.role === "OWNER";

    const isAssignee = issue.assigneeId === userId;

    if (!isPrivileged && !isAssignee) {
      throw new ApiError(
        403,
        "Only assignee or admin can edit this issue"
      );
    }

    const activities = [];

    if (data.title && data.title !== issue.title) {
      activities.push({
        field: "title",
        fromValue: issue.title,
        toValue: data.title,
      });
    }

    if (data.description && data.description !== issue.description) {
      activities.push({
        field: "description",
        fromValue: issue.description,
        toValue: data.description,
      });
    }

    if (data.priority && data.priority !== issue.priority) {
      activities.push({
        field: "priority",
        fromValue: issue.priority,
        toValue: data.priority,
      });
    }

    if (data.assigneeId !== undefined && data.assigneeId !== issue.assigneeId) {
      activities.push({
        field: "assignee",
        fromValue: issue.assigneeId ?? null,
        toValue: data.assigneeId ?? null,
      });

      if(data.assigneeId){
        await createNotificationService(data.assigneeId, "ISSUE_ASSIGNED", issue.id);
      }
    }

    const updated = await tx.issue.update({
      where: {
        id: issue.id,
        version: issue.version,
      },
      data: {
        ...data,
        version: { increment: 1 },
      },
    });

    if (activities.length > 0) {
      await tx.issueActivity.createMany({
        data: activities.map((a) => ({
          issueId: issue.id,
          userId,
          field: a.field,
          fromValue: a.fromValue?.toString() ?? null,
          toValue: a.toValue?.toString() ?? null,
        })),
      });
    }
    await deleteCache(`board:${issue.projectId}`);
    await deleteCache(`analytics:${issue.projectId}`);
    return updated;
  });
};

export const getProjectBoardService = async (projectId: string, userId: string) => {
   const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!membership) {
    throw new ApiError(403, "Not a project member");
  }

  const states = await prisma.workflowState.findMany({
    where: {
      projectId,
    },
    orderBy: {
      order: "asc",
    },
  });

  const issues = await prisma.issue.findMany({
    where: {
      projectId,
      isDeleted: false,
    },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  const board : Record<string, any[]> = {};

  states.forEach((state) => {
    board[state.name] = [];
  });

  issues.forEach((issue) => {
    const state = states.find((s) => s.id === issue.stateId);
    if (state) {
      const list = board[state.name];
      if (list) {
        list.push(issue);
      }
    }
  });

  return {
    board
  };
};

export const getProjectAnalyticsService = async (
  projectId: string,
  userId: string
) => {
   const cacheKey = `analytics:${projectId}`;
   const cached = await getCache(cacheKey);
   if (cached) {
    return cached;
   }
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
  
  if (!membership) {
    throw new ApiError(403, "Not a project member");
  }

  const totalIssues = await prisma.issue.count({
    where: {
      projectId,
      isDeleted: false,
    },
  });

  const doneState = await prisma.workflowState.findFirst({
    where: {
      projectId,
      name: "DONE",
    },
  });

  const completedIssues = await prisma.issue.count({
    where: {
      projectId,
      ...(doneState && { stateId: doneState.id }),
      isDeleted: false,
    },
  });

  const issuesPerState = await prisma.issue.groupBy({
    by: ["stateId"],
    where: {
      projectId,
      isDeleted: false,
    },
    _count: true,
  });

  const tasksPerUser = await prisma.issue.groupBy({
    by: ["assigneeId"],
    where: {
      projectId,
      isDeleted: false,
      assigneeId: { not: null },
    },
    _count: true,
  });

  const analytics = {
    totalIssues,
    completedIssues,
    completionRate:
      totalIssues === 0 ? 0 : completedIssues / totalIssues,
    issuesPerState,
    tasksPerUser,
  };

  await setCache(cacheKey, analytics, 30);

  return analytics;
};