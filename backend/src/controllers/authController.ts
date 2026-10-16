import { Request, Response, NextFunction } from 'express';
import { loginService } from '../services/authService';

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(422).json({ error: 'Email và mật khẩu là bắt buộc' });
    }
    const result = await loginService(email, password);
    return res.json(result);
  } catch (err: unknown) {
    return next(err);
  }
}

export function getMe(req: Request, res: Response) {
  // req.user được gắn bởi middleware auth
  return res.json((req as Request & { user: unknown }).user);
}
