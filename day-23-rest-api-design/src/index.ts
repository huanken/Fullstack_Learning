import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

// Data Models & In-memory Database
interface User {
  id: number;
  name: string;
  email: string;
}

interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
}

const users: User[] = [
  { id: 1, name: 'Sinh Huân', email: 'sinh.huan@example.com' },
  { id: 2, name: 'Thanh Mai', email: 'thanh.mai@example.com' }
];

let posts: Post[] = [
  { id: 1, userId: 1, title: 'Hướng dẫn thiết kế RESTful API chuẩn', content: 'REST sử dụng danh từ số nhiều và HTTP status codes chuẩn...', tags: ['backend', 'rest'], createdAt: new Date().toISOString() },
  { id: 2, userId: 1, title: 'Tối ưu hiệu năng Node.js Express', content: 'Sử dụng caching và tối ưu middleware chain...', tags: ['nodejs', 'performance'], createdAt: new Date().toISOString() },
  { id: 3, userId: 2, title: 'React Hooks & State Management', content: 'Tổng quan về useState, useEffect...', tags: ['react', 'frontend'], createdAt: new Date().toISOString() }
];
let nextPostId = 4;

// Standard Response Helpers (Theo bài học ngày 23)
const sendSuccess = <T>(res: Response, data: T, statusCode = 200, meta?: any) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {})
  });
};

const sendError = (res: Response, statusCode: number, message: string, code = 'ERROR', details?: any) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  });
};

// Root Info
app.get('/', (req: Request, res: Response) => {
  sendSuccess(res, {
    name: 'Day 23 - REST API Design Demo',
    rulesFollowed: [
      'Plural nouns for resources (/api/users, /api/posts)',
      'Nested resources for relationships (/api/users/:userId/posts)',
      'Standardized envelopes ({ success, data, meta } & { success: false, error })',
      'Accurate HTTP Status Codes (200, 201, 204, 400, 404, 422)'
    ]
  });
});

// 1. GET /api/posts with Filtering & Pagination (Query Params)
app.get('/api/posts', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 10);
  const tag = req.query.tag as string;

  let filtered = [...posts];
  if (tag) {
    filtered = filtered.filter(p => p.tags.includes(tag.toLowerCase()));
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  sendSuccess(res, paginatedData, 200, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  });
});

// 2. GET /api/users/:userId/posts — Nested Resource
app.get('/api/users/:userId/posts', (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return sendError(res, 404, `User with ID ${userId} not found`, 'RESOURCE_NOT_FOUND');
  }

  const userPosts = posts.filter(p => p.userId === userId);
  sendSuccess(res, userPosts, 200, { total: userPosts.length, user });
});

// 3. POST /api/users/:userId/posts — Nested Resource Creation with 422/400 Validation
app.post('/api/users/:userId/posts', (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const user = users.find(u => u.id === userId);

  if (!user) {
    return sendError(res, 404, `User with ID ${userId} not found`, 'USER_NOT_FOUND');
  }

  const { title, content, tags } = req.body;

  // Validation details
  const errors: Record<string, string> = {};
  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    errors.title = 'Title is required and must be at least 5 characters long';
  }
  if (!content || typeof content !== 'string') {
    errors.content = 'Content is required';
  }

  if (Object.keys(errors).length > 0) {
    return sendError(res, 422, 'Validation failed for post creation', 'VALIDATION_ERROR', errors);
  }

  const newPost: Post = {
    id: nextPostId++,
    userId,
    title: title.trim(),
    content: content.trim(),
    tags: Array.isArray(tags) ? tags : [],
    createdAt: new Date().toISOString()
  };

  posts.push(newPost);
  sendSuccess(res, newPost, 201);
});

// 4. DELETE /api/posts/:id (204 No Content)
app.delete('/api/posts/:id', (req: Request, res: Response) => {
  const postId = Number(req.params.id);
  const index = posts.findIndex(p => p.id === postId);

  if (index === -1) {
    return sendError(res, 404, `Post with ID ${postId} not found`, 'POST_NOT_FOUND');
  }

  posts.splice(index, 1);
  res.status(204).send();
});

// 404 & Global Error Handling
app.use((req: Request, res: Response) => {
  sendError(res, 404, `Endpoint ${req.method} ${req.originalUrl} does not exist`, 'ROUTE_NOT_FOUND');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Day 23 REST API Server running at http://localhost:${PORT}`);
  });
}

export default app;
