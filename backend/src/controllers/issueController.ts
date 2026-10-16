import { Request, Response, NextFunction } from 'express';
import * as issueService from '../services/issueService';

export async function listAllIssues(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, priority } = req.query as Record<string, string>;
    const issues = await issueService.getAllIssues({ status, priority });
    return res.json(issues);
  } catch (err) { return next(err); }
}

export async function listIssuesByApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, priority } = req.query as Record<string, string>;
    const issues = await issueService.getIssuesByApiDoc(Number(req.params.id), { status, priority });
    return res.json(issues);
  } catch (err) { return next(err); }
}

export async function getIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await issueService.getIssueById(Number(req.params.issueId));
    return res.json(issue);
  } catch (err) { return next(err); }
}

export async function createIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await issueService.createIssue(
      Number(req.params.id),
      req.body,
      req.user!.id
    );
    return res.status(201).json(issue);
  } catch (err) { return next(err); }
}

export async function updateIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await issueService.updateIssue(
      Number(req.params.issueId),
      req.body,
      req.user!.id,
      req.user!.role
    );
    return res.json(issue);
  } catch (err) { return next(err); }
}

export async function updateIssueStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const issue = await issueService.updateIssueStatus(
      Number(req.params.issueId),
      req.body.status,
      req.user!.role
    );
    return res.json(issue);
  } catch (err) { return next(err); }
}
