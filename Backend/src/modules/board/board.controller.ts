import {Request , Response} from "express"
import { getBoardService } from "./board.services.js"

export const getBoard = async (req : Request , res : Response) => {
  const {projectId} = req.params;
  const board = await getBoardService(projectId as string , (req as any).user.id);
  res.json({board});
}