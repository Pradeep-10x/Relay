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
  getProjectAnalyticsService,
  getIssueByIdService
} from "./issue.services.js";
import { issueParamsSchema, createIssueSchema, updateIssueStateSchema, updateIssueSchema, addDependencySchema } from "./issue.schema.js";
import { IssuePriority } from "@prisma/client";

export const createIssue = async (req: Request, res: Response) => {
  const { projectId } = issueParamsSchema.parse(req.params);
  const { title, description, priority, assigneeId, dueDate } = createIssueSchema.parse(req.body);

  const issue = await createIssueService(
    projectId as string,
    req.user!.id,
    title,
    (priority || "MEDIUM") as IssuePriority, 
    description || undefined,
    assigneeId || undefined,
    dueDate ? new Date(dueDate) : undefined
  );

  res.status(201).json(issue);
};



export const selfAssignIssue = async (req: Request, res: Response) => {
  const { issueId } = issueParamsSchema.parse(req.params);

  const result = await selfAssignIssueService(
    issueId as string,
    req.user!.id
  );

  res.json(result);
};


export const updateIssueState = async (req: Request, res: Response) => {
  const { issueId } = issueParamsSchema.parse(req.params);
  const { targetStateId } = updateIssueStateSchema.parse(req.body);

  const issue = await updateIssueStateService(
    issueId as string,
    req.user!.id,
    targetStateId
  );

  res.json(issue);
};


export const addDependency = async (req: Request, res: Response) => {
  const { issueId } = issueParamsSchema.parse(req.params);
  const { blockerId } = addDependencySchema.parse(req.body);

  const dependency = await addIssueDependencyService(
    issueId as string,
    req.user!.id,
    blockerId
  );

  res.status(201).json(dependency);
};

export const removeDependency = async (req: Request, res: Response) => {
  const { issueId, blockerId } = issueParamsSchema.parse(req.params);

  const result = await removeIssueDependencyService(
    issueId as string,
    req.user!.id,
    blockerId as string
  );

  res.json(result);
};

export const getIssueActivity = async (req: Request, res: Response) => {
  const { issueId } = issueParamsSchema.parse(req.params);

  const activity = await getIssueActivityService(issueId as string, req.user!.id);

  res.json(activity);
};

export const updateIssue = async (req: Request, res: Response) => {
  const { issueId } = issueParamsSchema.parse(req.params);
  const { title, description, priority, assigneeId, dueDate } = updateIssueSchema.parse(req.body);

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (priority !== undefined) updateData.priority = priority as IssuePriority;
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId;
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;

   const updatedIssue = await updateIssueService(
    issueId as string,
    req.user!.id,
    updateData
   );

   res.json({message : " Issue updated Successfully", isssue : updatedIssue,});
};

export const getProjectBoard = async (req: Request, res: Response) => {
  const { projectId } = issueParamsSchema.parse(req.params);

  const board = await getProjectBoardService(projectId as string, req.user!.id);

  res.json(board);
};

export const getProjectAnalytics = async (req: Request, res: Response) => {
  const { projectId } = issueParamsSchema.parse(req.params);

  const analytics = await getProjectAnalyticsService(projectId as string, req.user!.id);

  res.json(analytics);
}

export const getIssueById = async (req: Request, res: Response) => {
  const { issueId } = issueParamsSchema.parse(req.params);

  const issue = await getIssueByIdService(issueId as string, req.user!.id);

  res.json(issue);
};