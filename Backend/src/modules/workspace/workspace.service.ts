import {prisma} from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { WorkspaceRole } from "@prisma/client";

export const createWorkspaceService = async (userId: string, name: string) => {

    return  await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
        data: {
            name,
        }
    });

    await tx.workspaceMember.create({
        data: {
            userId,
            workspaceId: workspace.id,
            role: WorkspaceRole.OWNER,
        }
    });


    return workspace
});
};

export const getUserWorkspacesService = async (userId: string) => {
    return await prisma.workspace.findMany({
        where: {
            members: {
                some: {
                    userId,
                }
            }
        },
        include: {
            members: true,
        }
    });
};

export const addMembersToWorkspaceService = async (workspaceId: string, userId: string, role: WorkspaceRole , email: string) => {
 
  return prisma.$transaction(async (tx) => {
    const membership = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId,
        },
      },
    });

  if(!membership)
  {
    throw new ApiError(403, "You are not a member of this workspace");
  }

  if(membership.role !== WorkspaceRole.OWNER && membership.role !== WorkspaceRole.ADMIN)
  {
    throw new ApiError(403, "Only workspace owners and admins can add members");
  }

  
    const user = await tx.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const existing = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: user.id,
          workspaceId,
        },
      },
    });

    if (existing) {
      throw new ApiError(400, "User already in workspace");
    }
    
    if(role === WorkspaceRole.OWNER){
      const ownerCount = await tx.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceRole.OWNER,
        },
      });

      if (ownerCount >= 1) {
        throw new ApiError(400, "Workspace can only have one owner");
      }
    return tx.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role ,
      },
    });
  };
})};

