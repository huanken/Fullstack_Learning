import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { logger } from './middleware/logger';
import { authenticate, AuthenticatedRequest } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import taskRoutes from './routes/taskRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. BUILT-IN & THIRD-PARTY MIDDLEWARE CHAIN
// ==========================================

// Parse request body JSON (bắt buộc để đọc req.body)
app.use(express.json());

// Parse urlencoded bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS cho phép frontend gọi API
app.use(cors());

// Custom Logger Middleware: ghi log mọi request đi qua
app.use(logger);

// ==========================================
// 2. ROUTE DEFINITIONS
// ==========================================

// Trang chủ / Health check
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    message: 'Welcome to Day 22 - Node.js & Express Basics Demo API!',
    availableEndpoints: {
      tasks: '/api/tasks',
      users: '/api/users',
      eventLoopDemo: '/api/event-loop-demo',
      protectedAdminRoute: '/api/admin/stats (Cần Authorization: Bearer secret-token-123)'
    }
  });
});

// Demo giải thích Event Loop & Non-blocking I/O (Theo Mục 1 trong file md)
app.get('/api/event-loop-demo', async (req: Request, res: Response) => {
  const steps: string[] = [];
  steps.push('1. Bắt đầu xử lý request trên main thread (Event Loop)');

  // Giả lập I/O task (non-blocking, chuyển cho libuv/thread pool)
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      steps.push('2. I/O task hoàn thành sau 100ms và callback được đưa vào Event Loop queue');
      resolve();
    }, 100);
  });

  steps.push('3. Event Loop lấy callback ra xử lý và trả response');

  res.json({
    concept: 'Node.js Single-threaded Event Loop & Non-blocking I/O',
    executionSteps: steps,
    explanation: 'Main thread không bị block trong suốt quá trình chờ I/O hoàn thành.'
  });
});

// Mount Resource Routes
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Protected route demo: áp dụng authenticate middleware riêng cho route này
app.get('/api/admin/stats', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    message: 'Chào mừng Admin đến với trang thống kê bí mật!',
    currentUser: {
      id: req.userId,
      role: req.userRole
    },
    systemStats: {
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      memoryUsageMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
    }
  });
});

// Route giả lập phát sinh lỗi để test Error Handling Middleware
app.get('/api/simulate-error', (req: Request, res: Response, next: NextFunction) => {
  try {
    throw new Error('Đây là lỗi giả lập để kiểm tra Error Handling Middleware!');
  } catch (err) {
    next(err); // Chuyển lỗi tới error handling middleware
  }
});

// ==========================================
// 3. 404 & ERROR HANDLING MIDDLEWARE
// ==========================================

// 404 Not Found Middleware: chạy khi không có route nào ở trên khớp
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl
  });
});

// Global Error Handler: Luôn đặt ở CUỐI CÙNG với 4 tham số (err, req, res, next)
app.use(errorHandler);

// ==========================================
// 4. SERVER START
// ==========================================
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`📋 API Tasks: http://localhost:${PORT}/api/tasks`);
    console.log(`👤 API Users: http://localhost:${PORT}/api/users`);
    console.log(`=========================================`);
  });
}

export default app;
