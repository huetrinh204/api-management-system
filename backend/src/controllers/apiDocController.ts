import { Request, Response, NextFunction } from 'express';
import * as apiDocService from '../services/apiDocService';

export async function listApiDocs(req: Request, res: Response, next: NextFunction) {
  try {
    const { search, method, status } = req.query as Record<string, string>;
    const docs = await apiDocService.getApiDocs({ search, method, status });
    return res.json(docs);
  } catch (err) { return next(err); }
}

export async function getApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await apiDocService.getApiDocById(Number(req.params.id));
    return res.json(doc);
  } catch (err) { return next(err); }
}

export async function createApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await apiDocService.createApiDoc(req.body, req.user!.id);
    return res.status(201).json(doc);
  } catch (err) { return next(err); }
}

export async function updateApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await apiDocService.updateApiDoc(Number(req.params.id), req.body);
    return res.json(doc);
  } catch (err) { return next(err); }
}

export async function deleteApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    await apiDocService.deleteApiDoc(Number(req.params.id));
    return res.json({ message: 'Xóa tài liệu API thành công' });
  } catch (err) { return next(err); }
}
