import { randomUUID } from "crypto";
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
  // Atomic append at the database level. Avoids the previous read-modify-write
  // round-trip (which was O(n) per stroke and lost concurrent updates under
  // simultaneous drawing). Postgres appends the element to the jsonb array in a
  // single statement, so concurrent strokes are all preserved.
  const strokeJson = JSON.stringify([stroke]);
  await prisma.$executeRaw`
    INSERT INTO "ProjectBoard" ("id", "projectId", "strokes", "updatedAt")
    VALUES (${randomUUID()}, ${projectId}, ${strokeJson}::jsonb, now())
    ON CONFLICT ("projectId")
    DO UPDATE SET
      "strokes" = "ProjectBoard"."strokes" || ${strokeJson}::jsonb,
      "updatedAt" = now()
  `;
}
  