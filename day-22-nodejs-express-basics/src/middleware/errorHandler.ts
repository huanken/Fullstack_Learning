import { Request, Response, NextFunction } from 'express';

/**
 * Global Error Handling Middleware
 * Quan trọng: Phải có đúng 4 tham số (err, req, res, next) để Express nhận diện là error handler.
 * Middleware này luôn được đặt ở CUỐI CÙNG của app.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Error Handler] Bắt được lỗi không xử lý:', err.stack || err.message || err);

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
}
