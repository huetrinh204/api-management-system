import { Request, Response, NextFunction } from 'express';

interface AppError {
  status?: number;
  message?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status || 500;
  const message =
    status === 500 ? 'Lỗi máy chủ ngoài dự kiến' : err.message || 'Có lỗi xảy ra';

  // Không log chi tiết lỗi 500 ra response — chỉ log nội bộ
  if (status === 500) {
    console.error('[Server Error]', err);
  }

  return res.status(status).json({ error: message });
}
