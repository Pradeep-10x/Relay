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