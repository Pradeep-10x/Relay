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
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
    },
  },
}

    });
}
    
export const deleteWorkspaceService = async (workspaceId: string, userId: string) => {
   
     return prisma.$transaction(async(tx)=> {

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
     const workspace =  await tx.workspace.delete({
        where: {
            id: workspaceId,
        },
    });

     return { success: true, workspace };
}
     )
};

export const deleteWorkspaceMemberService = async (
  workspaceId: string,
  userId: string,
  targetUserId: string
) => {
  return prisma.$transaction(async (tx) => {
    const requester = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId,
        },
      },
    });

    if (!requester) {
      throw new ApiError(403, "Not a member");
    }

    if (requester.role === WorkspaceRole.MEMBER) {
      throw new ApiError(403, "Members cannot remove other members");
    }
    if (
      requester.role !== WorkspaceRole.OWNER &&
      requester.role !== WorkspaceRole.ADMIN
    ) {
      throw new ApiError(403, "Insufficient permissions");
    }

    const target = await tx.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
    });

    if (!target) {
      throw new ApiError(404, "Member to be deleted not found");
    }

    
    if (target.role === WorkspaceRole.OWNER) {
      const ownerCount = await tx.workspaceMember.count({
        where: {
          workspaceId,
          role: WorkspaceRole.OWNER,
        },
      });

      if (ownerCount <= 1) {
        throw new ApiError(
          400,
          "Workspace must have at least one owner"
        );
      }
    }

    return tx.workspaceMember.delete({
      where: {
        userId_workspaceId: {
          userId: targetUserId,
          workspaceId,
        },
      },
    });
  });
};
