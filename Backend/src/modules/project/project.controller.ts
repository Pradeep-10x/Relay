import { Request, Response } from "express";
import {
  createProjectService,
  getWorkspaceProjectsService,
  deleteProjectService,
  addMemberToProjectService,
  getProjectMembersService
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
    req.user!.id,
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
    req.user!.id,
    workspaceId as string
  );

  res.json(projects);
};

export const deleteProject = async (req: Request, res: Response) => {
  const { projectId } = projectParamsSchema.parse(req.params);

  await deleteProjectService(projectId as string, req.user!.id);

  res.json({ success: true });
};

export const addProjectMember = async (
  req: Request,
  res: Response
) => {
  const { projectId } = projectParamsSchema.parse(req.params);

  const parsed = addMemberSchema.parse(req.body);

  const member = await addMemberToProjectService(
    req.user!.id,
    projectId as string,
    
    parsed.email,
    parsed.role
  );

  res.status(201).json(member);
};

export const getProjectMembers = async (req: Request, res: Response) => {
  const { projectId } = projectParamsSchema.parse(req.params);

  const members = await getProjectMembersService(
    req.user!.id,
    projectId as string
  );

  res.json(members);
};
