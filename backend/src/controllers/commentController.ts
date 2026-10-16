import { Request, Response, NextFunction } from 'express';
import * as commentService from '../services/commentService';

export async function getCommentsByApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const comments = await commentService.getCommentsByApiDoc(Number(req.params.id));
    return res.json(comments);
  } catch (err) { return next(err); }
}

export async function createCommentOnApiDoc(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentService.createCommentOnApiDoc(
      Number(req.params.id), req.body.content, req.user!.id
    );
    return res.status(201).json(comment);
  } catch (err) { return next(err); }
}

export async function getCommentsByIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const comments = await commentService.getCommentsByIssue(Number(req.params.issueId));
    return res.json(comments);
  } catch (err) { return next(err); }
}

export async function createCommentOnIssue(req: Request, res: Response, next: NextFunction) {
  try {
    const comment = await commentService.createCommentOnIssue(
      Number(req.params.issueId), req.body.content, req.user!.id
    );
    return res.status(201).json(comment);
  } catch (err) { return next(err); }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    await commentService.deleteComment(Number(req.params.commentId), req.user!.id);
    return res.json({ message: 'Xóa bình luận thành công' });
  } catch (err) { return next(err); }
}
