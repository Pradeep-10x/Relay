import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { getCache , setCache } from "../../utils/cache.js";

export const getKanbanBoardService = async (projectId : string , userId : string) => {

  // Authorization must run before serving cached data, otherwise a non-member
  // could read a cached board for any project.
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });
  if(!membership) {
    throw new ApiError(403, "User is not a member of this project");
  }

  const cacheKey = `board:${projectId}`;
  const cached = await getCache(cacheKey);
  if (cached)
    return cached;

  const states = await prisma.workflowState.findMany({
    where: { projectId },
    orderBy: { order: "asc" }
  });

  const issues = await prisma.issue.findMany({
    where: {
      projectId,
      isDeleted: false
    },
    include: {
      state: true,
      assignee: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
        },
      },
      _count: {
        select: { issueComments: true },
      },
    },
  });

  const board: Record<string, any[]> = {};
  const stateById = new Map(states.map((s) => [s.id, s]));

  states.forEach((state) => {
    board[state.name] = [];
  });

  issues.forEach((issue) => {
    const state = stateById.get(issue.stateId);
    if (state) {
      const columnList = board[state.name];
      if (columnList) {
        columnList.push(issue);
      }
    }
  });
  const result = { board, states: states.map(s => ({ id: s.id, name: s.name })) };
  await setCache(cacheKey, result, 30);
  return result;
};