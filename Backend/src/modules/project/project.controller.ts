import { Request, Response } from "express";
import {
  createProjectService,
  getWorkspaceProjectsService,
  deleteProjectService,
  addMemberToProjectService
} from "./project.service.js";
import {
  createProjectSchema,
  addMemberSchema,
  projectParamsSchema,
} from "./project.schema.js";

export const createProject = async (req: Request, res: Response) => {
  const { workspaceId } = projectParamsSchema.parse(req.params);

  const parsed = createProjectSchema.parse(req.body);

  const project = await createProjectService(
    (req as any).user.id,
    workspaceId as string,
    parsed.name
  );
    
  res.status(201).json(project);
};

export const getWorkspaceProjects = async (
  req: Request,
  res: Response
) => {
  const { workspaceId } = projectParamsSchema.parse(req.params);

  const projects = await getWorkspaceProjectsService(
    (req as any).user.id,
    workspaceId as string
  );

  res.json(projects);
};

export const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = projectParamsSchema.parse(req.params);

  await deleteProjectService(projectId as string, (req as any).user.id);

  res.json({ success: true });
};

export const addProjectMember = async (
  req: Request,
  res: Response
) => {
  const { projectId } = projectParamsSchema.parse(req.params);

  const parsed = addMemberSchema.parse(req.body);

  const member = await addMemberToProjectService(
    (req as any).user.id,
    projectId as string,
    
    parsed.email,
    parsed.role
  );

  res.status(201).json(member);
};
