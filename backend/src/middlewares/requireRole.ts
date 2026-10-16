import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Chưa xác thực' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Không đủ quyền thực hiện thao tác này' });
    }
    return next();
  };
}
