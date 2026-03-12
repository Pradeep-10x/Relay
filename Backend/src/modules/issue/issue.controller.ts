import { Request, Response } from "express";
import {
  createIssueService,
  selfAssignIssueService,
  updateIssueStateService,
  addIssueDependencyService,
  removeIssueDependencyService,
  getIssueActivityService,
  updateIssueService,
  getProjectBoardService,
  getProjectAnalyticsService
} from "./issue.services.js";

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


export const addDependency = async (req: Request, res: Response) => {
  const { issueId } = req.params;
  const { blockerId } = req.body;

  const dependency = await addIssueDependencyService(
    issueId as string,
    (req as any).user.id,
    blockerId
  );

  res.status(201).json(dependency);
};

export const removeDependency = async (req: Request, res: Response) => {
  const { issueId, blockerId } = req.params;

  const result = await removeIssueDependencyService(
    issueId as string,
    (req as any).user.id,
    blockerId as string
  );

  res.json(result);
};

export const getIssueActivity = async (req: Request, res: Response) => {
  const { issueId } = req.params;

  const activity = await getIssueActivityService(issueId as string);

  res.json(activity);
};

export const updateIssue = async (req: Request, res: Response) => {
  const { issueId } = req.params;
  const { title, description, priority, assigneeId } = req.body;

   const updatedIssue = await updateIssueService(
    issueId as string,
    (req as any).user.id,
    {
    title,
    description,
    priority,
    assigneeId
    }
   );

   res.json({message : " Issue updated Successfully", isssue : updatedIssue,});
};

export const getProjectBoard = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const board = await getProjectBoardService(projectId as string, (req as any).user.id);

  res.json(board);
};

export const getProjectAnalytics = async (req: Request, res: Response) => {
  const { projectId } = req.params;

  const analytics = await getProjectAnalyticsService(projectId as string, (req as any).user.id);

  res.json(analytics);
}