import {Request , Response} from "express";
import { asyncHandler
 } from "../../utils/AsyncHandler.js";
 import { ApiError } from "../../utils/ApiError.js";
 import { createWorkspaceService , getUserWorkspacesService } from "./workspace.service.js";
import { workspaceSchema } from "./workspace.schema.js";


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