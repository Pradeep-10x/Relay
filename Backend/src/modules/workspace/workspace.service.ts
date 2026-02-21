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
    if (user.id === userId) {
  throw new ApiError(400, "You are already part of this workspace");
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
    
    if (
      membership.role === WorkspaceRole.ADMIN &&
      role !== WorkspaceRole.MEMBER
    ) {
      throw new ApiError(403, "Admin can only assign MEMBER role");
    }

    if (role === WorkspaceRole.OWNER) {
      throw new ApiError(400, "Cannot assign OWNER role");
    }

    if (!Object.values(WorkspaceRole).includes(role)) {
  throw new ApiError(400, "Invalid role");
}


    
    return tx.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId,
        role ,
      },
    });
  });
}

export const getWorkspaceMembersService = async (workspaceId: string , userId: string) => {
    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId,
            },
        },
    });

    if(!membership)
    {
        throw new ApiError(403, "You are not a member of this workspace");
    }

    return await prisma.workspaceMember.findMany({
        where: {
            workspaceId,
        },
        include: {
            user: true,
        }
    });
}
    
export const deleteWorkspaceService = async (workspaceId: string, userId: string) => {
    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId,
                workspaceId,
            },
        },
    });

    if(!membership)
    {
        throw new ApiError(403, "You are not a member of this workspace");
    }

    if(membership.role !== WorkspaceRole.OWNER)
    {
        throw new ApiError(403, "Only workspace owners can delete the workspace");
    }
     return prisma.$transaction(async(tx)=> {
     const workspace =  await tx.workspace.delete({
        where: {
            id: workspaceId,
        },
    });

     return { success: true, workspace };
}
     )
};

export const deleteWorkspaceMemberService = async (workspaceId: string, userId: string , targetUserId: string) => {
    const membership = await prisma.workspaceMember.findUnique({
        where: {
            userId_workspaceId: {
                userId,
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
        throw new ApiError(403, "Only workspace owners and admins can remove members");
    }

     return prisma.workspaceMember.delete({
        where: {
            userId_workspaceId: {
                userId: targetUserId,
                workspaceId,
            },
        },
    });
}