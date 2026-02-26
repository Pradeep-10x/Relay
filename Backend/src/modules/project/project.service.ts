import { success } from "zod";
import { prisma } from "../../lib/prisma.js";
import { ApiError } from "../../utils/ApiError.js";
import { ProjectRole } from "@prisma/client";
import { generateBaseKey } from "../../utils/generateKey.js";
export const createProjectService= async (userId: string, workspaceId: string, name: string) => {

    return prisma.$transaction(async (tx) => {
     const workspaceMembership = await tx.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

      if (!workspaceMembership) {
        throw new ApiError(403, "You are not a member of this workspace");
      }
       if (workspaceMembership.role !== "OWNER" && workspaceMembership.role !== "ADMIN") {
        throw new ApiError(403, "Only owners and admins can create projects in workspace");
      }
      const baseKey = generateBaseKey(name);
      let key = baseKey;
      let counter = 1;
      while(true)
      {        const existingProject = await tx.project.findUnique({
          where: { key },
        });
        if (!existingProject) {
          break;
        }
        key = `${baseKey}${counter}`;
        counter++;
      }
      const project = await tx.project.create({
        data: {
          name,
          key,
          workspaceId,
        },
      });

      await tx.projectMember.create({
        data: {
          userId,
          projectId: project.id,
          role: ProjectRole.OWNER,
        },
      });

       await tx.workflowState.createMany({
        data: [
          {
            name: "OPEN",
            projectId: project.id,
            order: 1,
          },
          {
            name: "In_Progress",
            projectId: project.id,
            order: 2,
          },
          {
            name: "Review",
            projectId: project.id,
            order: 3,
          },
          {
            name: "Done",
            projectId: project.id,
            order: 4,
          },
        ],
      });

      const state = await tx.workflowState.findMany({
        where: { projectId: project.id },
      });

      const stateMap = Object.fromEntries(state.map((s) => [s.name, s.id]));
      
      await tx.workflowTransition.createMany({
        data: [
          {
            projectId: project.id,
            fromStateId: stateMap.OPEN as string,
            toStateId: stateMap.In_Progress as string,
            allowedRoles : "MEMBER"
          },
          {
            projectId: project.id,
            fromStateId: stateMap.In_Progress as string,
            toStateId: stateMap.Review as string,
            allowedRoles : "MEMBER"
          },
          {
            projectId: project.id,
            fromStateId: stateMap.Review as string,
            toStateId: stateMap.Done as string,
            allowedRoles : "ADMIN"
          },
          {
            projectId: project.id,
            fromStateId: stateMap.Done as string,
            toStateId: stateMap.In_Progress as string,
            allowedRoles : "ADMIN"
          },
        ],
      });

      return project;
    });
}

export const getWorkspaceProjectsService = async (userId: string, workspaceId: string) => {
    const workspaceMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

      if (!workspaceMembership) {
        throw new ApiError(403, "You are not a member of this workspace");
      }

      return prisma.project.findMany({
        where: { workspaceId },
      });
};

export const deleteProjectService = async (userId: string, projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
    const projectMembership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: {
        userId,
        projectId,
      },
    },
  });

  if (!projectMembership) {
    throw new ApiError(403, "You are not a member of this project");
  }
   const workspaceMembership = await prisma.workspaceMember.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId: project.workspaceId,
      },
    
    },

  });
  if(!workspaceMembership || (workspaceMembership.role !== "OWNER" && workspaceMembership.role !== "ADMIN")) {
    throw new ApiError(403, "Only workspace owners and admins can delete projects");
  }

  if (projectMembership.role !== "OWNER") {
    throw new ApiError(403, "Only project owner can delete this project");
  }

  await prisma.project.delete({
    where: { id: projectId },
  });

  return {
    success: true,
    message: "Project deleted successfully",
  };
};

export const addMemberToProjectService = async (userId: string, projectId: string, memberEmail: string, role: ProjectRole) => {

    return prisma.$transaction(async (tx) => {
     const project = await tx.project.findUnique({
        where: { id: projectId },
      });

      if (!project) {
        throw new ApiError(404, "Project not found");
      }

      const projectMembership = await tx.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId,
            projectId,
          },
        },
      });

      if (!projectMembership) {
        throw new ApiError(403, "You are not a member of this project");
      }
      if (projectMembership.role === ProjectRole.MEMBER) {
        throw new ApiError(403, "Only project owners and admins can add members to a project");
      }
       
      if (projectMembership.role === ProjectRole.ADMIN && role !== ProjectRole.MEMBER) {
        throw new ApiError(403, "Admin can only add members with MEMBER role");
      }
       if(role === ProjectRole.OWNER) {
        throw new ApiError(403, "You cannot assign OWNER role to a member");
       }

       const targetUser = await tx.user.findUnique({
        where: { email: memberEmail },
       });

       if (!targetUser) {
        throw new ApiError(404, "User not found");
       }
       const targetUserMembership = await tx.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: targetUser.id,
            workspaceId: project.workspaceId,
          },
        },
       });

       if (!targetUserMembership) {
        throw new ApiError(400, "User is not a member of the workspace");
       }
       const existingMembership = await tx.projectMember.findUnique({
        where: {
          userId_projectId: {
            userId: targetUser.id,
            projectId,
          },
        },
       });

       if (existingMembership) {
        throw new ApiError(400, "User is already a member of the project");
       }
       if(role === ProjectRole.ADMIN) {
        const existingAdmin = await tx.projectMember.findFirst({
          where: {
            projectId,
            role: ProjectRole.ADMIN,
          },
        });

        if (existingAdmin) {
          throw new ApiError(400, "Project already has an admin");
        }
       }

       return tx.projectMember.create({
        data: {
          userId: targetUser.id,
          projectId,
          role,
        },
       });
    });
}


      