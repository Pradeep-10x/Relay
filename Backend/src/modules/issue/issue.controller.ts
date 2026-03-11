import { Request, Response } from "express";
import { createIssueService, selfAssignIssueService , updateIssueStateService} from "./issue.services.js";
import { prisma } from "../../lib/prisma.js";

export const createIssue = async (req: Request, res: Response) => {
  const { projectId } = req.params;
  const { title, description, priority, assigneeId } = req.body;

  const issue = await createIssueService(
    projectId as string,
    (req as any).user.id,
    title,
    description,
    priority,
    assigneeId
  );

  res.status(201).json(issue);
};



export const selfAssignIssue = async (req: Request, res: Response) => {
  const { issueId } = req.params;

  const result = await selfAssignIssueService(
    issueId as string,
    (req as any).user.id
  );

  res.json(result);
};


export const updateIssueState = async (req: Request, res: Response) => {
  const { issueId } = req.params;
  const { targetStateId } = req.body;

  const issue = await updateIssueStateService(
    issueId as string,
    (req as any).user.id,
    targetStateId
  );

  res.json(issue);
};