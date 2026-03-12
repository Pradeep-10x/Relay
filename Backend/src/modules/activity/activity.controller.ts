import {Request, Response} from "express";
import { getIssueActivityService } from "./activity.services.js";

export const getIssueActivity = async (req : Request, res : Response) => {
  const {issueId} = req.params;
  if(!issueId) {
    return res.status(400).json({ message: "Issue id is required" });
  }
  const activity = await getIssueActivityService(issueId as string, (req as any).user.id);  
  res.json(activity);
}