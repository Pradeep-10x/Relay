import {Request , Response} from "express";
import { asyncHandler
 } from "../../utils/AsyncHandler.js";
 import { ApiError } from "../../utils/ApiError.js";
 import { createWorkspaceService , getUserWorkspacesService ,addMembersToWorkspaceService ,getWorkspaceMembersService} from "./workspace.service.js";
import { workspaceSchema , addMemberSchema , getMembersSchema } from "./workspace.schema.js";


export const createWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const parsed = workspaceSchema.parse(req.body);
    const workspace = await createWorkspaceService(user.id, parsed.name)
    res.status(201).json({ message: "Workspace created successfully", workspace });
});

export const getWorkspaces = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user) {
        throw new ApiError(401, "Unauthorized");
    }
    const workspaces = await getUserWorkspacesService(user.id);
    res.status(200).json({ workspaces })
});

export const addMemberToWorkspace = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { workspaceId } = req.params;
    const parsed = addMemberSchema.parse(req.body);
    const workspace = await addMembersToWorkspaceService(workspaceId as string, user.id, parsed.role, parsed.email);
    res.status(200).json({ message: "Member added successfully", workspace });
}
);

export const getWorkspaceMembers = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const { workspaceId } = req.params;
    const parsed = getMembersSchema.parse({ workspaceId });
    const members = await getWorkspaceMembersService(parsed.workspaceId, user.id);
    res.status(200).json({ members });
});