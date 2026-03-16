import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { getCache , setCache } from "../../utils/cache.js";

export const getKanbanBoardService = async (projectId : string , userId : string) => {

    const cacheKey = `board:${projectId}`;
    const cached = await getCache(cacheKey); 
    if (cached) 
        return cached;
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
    },
  });

  const board: Record<string, any[]> = {};

  states.forEach((state) => {
    board[state.name] = [];
  });

  issues.forEach((issue) => {

    const state = states.find(
      (s) => s.id === issue.stateId
    );

    if (state) {
      const columnList = board[state.name];
      if (columnList) {
        columnList.push(issue);
      }
  } } )
  await setCache(cacheKey, board, 30);
  return board;
};