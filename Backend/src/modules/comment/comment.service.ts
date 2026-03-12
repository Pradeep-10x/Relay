import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";


export const createCommentService = async (
  issueId: string,
  userId: string,
  content: string
) => {
     const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { id: true, projectId: true },
     });

     if (!issue) {
      throw new ApiError(404, "Issue not found");
     }

     const membership = await prisma.projectMember.findUnique({
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


     const comment = await prisma.issueComment.create({
      data: {
        issueId,
        userId,
        content,
      },
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

     return comment;
    };
    
export const getIssueCommentsService = async (
  issueId: string ) => {
    
  return await prisma.issueComment.findMany({
    where: { issueId ,deleted : false},
    orderBy: { createdAt: "asc" },
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

export const editCommentService = async (
  commentId: string,
  userId: string,
  content: string ) => {
    const comment = await prisma.issueComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    if (comment.userId !== userId) {
      throw new ApiError(403, "You can edit only your comments");
    }

    return await prisma.issueComment.update({
      where: { id: commentId },
      data: { content , edited: true},
    });
  };
