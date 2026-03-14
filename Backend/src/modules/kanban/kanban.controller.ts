import { Request, Response } from "express";
import { getKanbanBoardService } from "./kanban.service.js";
import { getKanbanSchema } from "./kanban.schema.js";

export const getKanbanBoard = async (req: Request , res: Response) => {
     const { projectId } = getKanbanSchema.parse(req.params);
     const board = await getKanbanBoardService( projectId as string, (req as any).user.id);
     return res.status(200).json(board);

}