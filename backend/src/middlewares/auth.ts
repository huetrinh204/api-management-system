import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User';
import { User } from '../models';

export interface AuthPayload {
  id: number;
  email: string;
  role: UserRole;
}

// Mở rộng Express Request để có req.user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Chưa đăng nhập hoặc token không hợp lệ' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ error: 'Lỗi cấu hình server' });

  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    
    // Check if user still exists and is active
    const user = await User.findByPk(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'Tài khoản không tồn tại' });
    }
    
    if (!user.is_active) {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' });
    }
    
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}
