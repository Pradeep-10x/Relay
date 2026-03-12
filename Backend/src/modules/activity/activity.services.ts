import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

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
            name: true,
            avatar: true,
          }
        }
      }
    })
  } 