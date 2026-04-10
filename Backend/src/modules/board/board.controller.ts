import {Request , Response} from "express"
import { getBoardService } from "./board.services.js"
import { getBoardSchema } from "./board.schema.js"

export const getBoard = async (req : Request , res : Response) => {
  const { projectId } = getBoardSchema.parse(req.params);
  const board = await getBoardService(projectId as string , req.user!.id);
  res.json({board});
}