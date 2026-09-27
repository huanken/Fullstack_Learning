import { Request, Response, NextFunction } from 'express';

// Mở rộng interface Request của Express để chứa userId
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userRole?: string;
}

/**
 * Authentication Middleware
 * Kiểm tra header Authorization: Bearer <token>
 * Dùng cho các route yêu cầu bảo mật (như /api/admin/* hoặc /api/protected/*)
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '').trim();

  if (!token) {
    res.status(401).json({
      error: 'Unauthorized: No token provided. Include header "Authorization: Bearer secret-token-123"'
    });
    return; // Dừng lại ở đây, không gọi next()
  }

  // Giả lập xác thực token
  if (token === 'secret-token-123' || token === 'admin-token') {
    req.userId = 'user- sinhhuan-01';
    req.userRole = token === 'admin-token' ? 'admin' : 'member';
    next(); // Token hợp lệ -> Chuyển sang middleware/route handler kế tiếp
  } else {
    res.status(401).json({
      error: 'Unauthorized: Invalid or expired token'
    });
  }
}
