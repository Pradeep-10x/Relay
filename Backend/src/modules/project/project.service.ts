
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
      
      const existingCount = await tx.project.count({
        where: { key: { startsWith: baseKey } }
      });
      
      let key = baseKey;
      if (existingCount > 0) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        key = `${baseKey}-${randomSuffix}`;
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
            name: "IN_PROGRESS",
            projectId: project.id,
            order: 2,
          },
          {
            name: "REVIEW",
            projectId: project.id,
            order: 3,
          },
          {
            name: "DONE",
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
            toStateId: stateMap.IN_PROGRESS as string,
            allowedRoles : "MEMBER"
          },
          {
            projectId: project.id,
            fromStateId: stateMap.IN_PROGRESS as string,
            toStateId: stateMap.REVIEW as string,
            allowedRoles : "MEMBER"
          },
          {
            projectId: project.id,
            fromStateId: stateMap.REVIEW as string,
            toStateId: stateMap.DONE as string,
            allowedRoles : "ADMIN"
          },
          {
            projectId: project.id,
            fromStateId: stateMap.DONE as string,
            toStateId: stateMap.IN_PROGRESS as string,
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
       include: {
        Issues: {
          include: { 
            state: true,
            assignee: { select: { id: true, name: true, avatar: true } },
            project: { select: { name: true, key: true } }
          }
        },
        members: true,
      }
      });
};

export const deleteProjectService = async (projectId: string, userId: string) => {
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
      const [project, projectMembership, targetUser] = await Promise.all([
        tx.project.findUnique({ where: { id: projectId } }),
        tx.projectMember.findUnique({
          where: { userId_projectId: { userId, projectId } },
        }),
        tx.user.findUnique({ where: { email: memberEmail } })
      ]);

       if (!targetUser) {
        throw new ApiError(404, "User not found");
       }
      if (!project) {
        throw new ApiError(404, "Project not found");
      }
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
      if (!targetUser) {
        throw new ApiError(404, "User not found");
      }

      const [targetUserMembership, existingMembership, existingAdmin] = await Promise.all([
        tx.workspaceMember.findUnique({
          where: {
            userId_workspaceId: {
              userId: targetUser.id,
              workspaceId: project.workspaceId,
            },
          },
        }),
        tx.projectMember.findUnique({
          where: {
            userId_projectId: {
              userId: targetUser.id,
              projectId,
            },
          },
        }),
        role === ProjectRole.ADMIN ? tx.projectMember.findFirst({
          where: {
            projectId,
            role: ProjectRole.ADMIN,
          },
        }) : Promise.resolve(null)
      ]);

      if (!targetUserMembership) {
        throw new ApiError(400, "User is not a member of the workspace");
      }
      if (existingMembership) {
        throw new ApiError(400, "User is already a member of the project");
      }
      if (existingAdmin) {
        throw new ApiError(400, "Project already has an admin");
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

export const getProjectMembersService = async (userId: string, projectId: string) => {
  const membership = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  return prisma.projectMember.findMany({
    where: { projectId },
    include: {
      user: {
        select: { id: true, name: true, email: true, username: true, avatar: true },
      },
    },
    orderBy: { role: 'asc' }, // usually puts OWNER first
  });
};