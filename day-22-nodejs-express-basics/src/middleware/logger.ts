import { Request, Response, NextFunction } from 'express';

/**
 * Logger Middleware
 * Ghi lại thời gian, phương thức HTTP, URL và thời gian phản hồi
 */
export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });

  next(); // Luôn gọi next() để chuyển qua middleware tiếp theo trong chain
}
