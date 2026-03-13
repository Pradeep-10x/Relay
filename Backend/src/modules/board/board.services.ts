import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";


export const getBoardService = async (projectId : string , userId : string) => {
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
  const board = await prisma.projectBoard.findUnique({
    where: { projectId },
  });
  if(!board) {
    throw new ApiError(404, "Board not found");
  }
  return board.strokes
}

export const saveStrokeService = async (projectId : string , stroke : any) => {
  const board = await prisma.projectBoard.findUnique({
    where: { projectId }
  });
  if(!board) {
  return prisma.projectBoard.create({
    data: {
      projectId,
      strokes: [stroke],
    },
  });
}

const strokes = board.strokes as any[];
strokes.push(stroke);
 return await prisma.projectBoard.update({
  where: { projectId },
  data: { strokes },
});
}
  