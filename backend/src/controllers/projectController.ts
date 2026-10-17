import { Request, Response, NextFunction } from 'express';
import * as projectService from '../services/projectService';

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search } = req.query as Record<string, string>;
    const projects = await projectService.getProjects({ status: status as any, search });
    return res.json(projects);
  } catch (err) {
    return next(err);
  }
}

export async function getProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProjectById(Number(req.params.id));
    return res.json(project);
  } catch (err) {
    return next(err);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.user.id) {
      const error: any = new Error('Authentication required');
      error.statusCode = 401;
      throw error;
    }
    const project = await projectService.createProject(req.body, req.user.id);
    return res.status(201).json(project);
  } catch (err) {
    return next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(Number(req.params.id), req.body);
    return res.json(project);
  } catch (err) {
    return next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteProject(Number(req.params.id));
    return res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    return next(err);
  }
}

export async function listApiDocsByProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, method, status } = req.query as Record<string, string>;
    const apiDocs = await projectService.getApiDocsByProject(Number(req.params.id), {
      search,
      method,
      status,
    });
    return res.json(apiDocs);
  } catch (err) {
    return next(err);
  }
}
