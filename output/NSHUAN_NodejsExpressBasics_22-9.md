# 📋 Learning Review — Ngày 22/09/2026 (Thứ Ba)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 22/09/2026 (Tue) |
| **Chủ đề** | **Review Meeting + Node.js & Express Basics** |
| **Session Type** | Review Meeting (30 min) + Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **30-min mentor review of Fri–Mon topics; then Node.js runtime & Express.js fundamentals: routing, middleware**

---

## 📝 Review Meeting — Tóm tắt các chủ đề Fri–Mon

> Buổi review 30 phút với mentor, ôn lại 4 ngày trước:

| Ngày | Chủ đề | Key Takeaways |
|------|--------|--------------|
| 18/09 (Fri) | Web Frontend Fundamentals | HTML semantics, CSS box model, DOM, request/response cycle |
| 19/09 (Sat) | React Fundamentals | JSX, functional components, props vs state, composition, list rendering with keys |
| 20/09 (Sun) | React Hooks & State Management | useState, useEffect, lifting state up, local vs shared state |
| 21/09 (Mon) | TypeScript & API Consumption | TS types/interfaces, typing API responses, fetch/axios, error handling |

---

## 🔍 Key Concepts cần nắm vững

### 1. Node.js Event Loop

- **Node.js** là JavaScript runtime xây dựng trên **V8 engine** (cùng engine của Chrome)
- Node.js chạy JavaScript **ngoài browser** — trên server
- Đặc điểm cốt lõi: **Single-threaded, non-blocking, event-driven**

**So sánh với các nền tảng khác:**

| | Node.js | Java (Spring) | Dart (Server) |
|---|---|---|---|
| **Threading** | Single-threaded + event loop | Multi-threaded | Single-threaded + isolates |
| **I/O Model** | Non-blocking async | Blocking (thread per request) | Non-blocking async |
| **Concurrency** | Event loop + callbacks/promises | Thread pool | Event loop + isolates |

**Event Loop hoạt động như thế nào:**

```
   ┌───────────────────────────────┐
┌─>│         timers (setTimeout)    │
│  └─────────────┬─────────────────┘
│  ┌─────────────┴─────────────────┐
│  │    pending callbacks (I/O)    │
│  └─────────────┬─────────────────┘
│  ┌─────────────┴─────────────────┐
│  │       idle, prepare           │
│  └─────────────┬─────────────────┘
│  ┌─────────────┴─────────────────┐
│  │          poll (I/O events)    │  ◄── incoming connections, data, etc.
│  └─────────────┬─────────────────┘
│  ┌─────────────┴─────────────────┐
│  │     check (setImmediate)      │
│  └─────────────┬─────────────────┘
│  ┌─────────────┴─────────────────┐
│  │     close callbacks           │
│  └─────────────┬─────────────────┘
└─────────────────┘
```

**Ví dụ minh họa non-blocking:**

```javascript
const fs = require('fs');

console.log('1. Start');

// Non-blocking — Node không đợi file đọc xong
fs.readFile('bigfile.txt', 'utf8', (err, data) => {
  console.log('3. File read complete');
});

console.log('2. End');

// Output:
// 1. Start
// 2. End
// 3. File read complete  ← chạy sau, khi I/O hoàn thành
```

**Tại sao single-threaded mà vẫn xử lý được nhiều request?**

```
Request 1: đọc database (async) → gửi I/O → event loop tiếp tục
Request 2: đọc file (async) → gửi I/O → event loop tiếp tục
Request 3: tính toán đơn giản → trả response ngay

Khi database trả kết quả → callback của Request 1 được đưa vào queue → event loop xử lý
Khi file đọc xong → callback của Request 2 được đưa vào queue → event loop xử lý
```

→ Không cần tạo thread mới cho mỗi request! Tiết kiệm memory, phù hợp cho **I/O-intensive** apps (API server, real-time apps).

### 2. Express App Setup

- **Express.js** là framework web **nhẹ nhất** và **phổ biến nhất** cho Node.js
- Cung cấp: routing, middleware, request/response handling
- Tương tự: Flask (Python), Gin (Go), Shelf (Dart)

**Cài đặt và khởi tạo:**

```bash
# Tạo project
mkdir my-api && cd my-api
npm init -y

# Cài đặt
npm install express
npm install -D typescript @types/express @types/node ts-node nodemon

# Tạo tsconfig.json
npx tsc --init
```

**Cấu trúc project cơ bản:**

```
my-api/
├── src/
│   ├── index.ts          # Entry point
│   ├── routes/
│   │   └── userRoutes.ts # Route definitions
│   ├── middleware/
│   │   └── auth.ts       # Middleware functions
│   └── controllers/
│       └── userController.ts
├── package.json
└── tsconfig.json
```

**Express app cơ bản với TypeScript:**

```typescript
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// Built-in middleware — parse JSON body
app.use(express.json());

// Simple route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### 3. Routing & Middleware Chain

**Routing — định nghĩa endpoints:**

```typescript
import { Router, Request, Response } from 'express';

const router = Router();

// GET /users — lấy danh sách users
router.get('/users', (req: Request, res: Response) => {
  res.json({ users: [] });
});

// GET /users/:id — lấy 1 user theo ID
router.get('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.json({ user: { id } });
});

// POST /users — tạo user mới
router.post('/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  res.status(201).json({ user: { name, email } });
});

// PUT /users/:id — cập nhật user
router.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;
  res.json({ user: { id, ...updates } });
});

// DELETE /users/:id — xóa user
router.delete('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  res.status(204).send();
});

export default router;

// Trong index.ts:
// app.use('/api', router);
// → /api/users, /api/users/:id
```

**Middleware — hàm trung gian xử lý request trước khi đến route handler:**

```
Request → [Middleware 1] → [Middleware 2] → [Route Handler] → Response
             logger          auth check       business logic
```

```typescript
import { Request, Response, NextFunction } from 'express';

// 1. Logger middleware
function logger(req: Request, res: Response, next: NextFunction) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();  // ← PHẢI gọi next() để chuyển sang middleware/handler tiếp theo
}

// 2. Auth middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
    // Không gọi next() → request dừng ở đây
  }
  
  try {
    // verify token...
    (req as any).userId = 'decoded-user-id';
    next();  // Token hợp lệ → tiếp tục
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// 3. Error handling middleware (4 params)
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
}

// Áp dụng middleware
app.use(logger);                          // Mọi request đều qua logger
app.use('/api/admin', authenticate);      // Chỉ routes /api/admin/* cần auth
app.use(errorHandler);                    // Error handler luôn ở cuối
```

**Thứ tự middleware quan trọng:**

```typescript
const app = express();

// 1. Parse body (phải đặt trước route handlers)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. CORS (phải đặt trước routes)
app.use(cors());

// 3. Logger
app.use(logger);

// 4. Routes
app.use('/api', router);

// 5. 404 handler (sau tất cả routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// 6. Error handler (luôn cuối cùng, có 4 params)
app.use(errorHandler);
```

### 4. Request/Response Objects

**Request object — chứa thông tin từ client:**

```typescript
app.get('/api/products', (req: Request, res: Response) => {
  // Query parameters: /api/products?page=2&limit=10&sort=name
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sort = req.query.sort as string;

  // Headers
  const token = req.headers.authorization;
  const contentType = req.headers['content-type'];

  // Client info
  const ip = req.ip;
  const method = req.method;   // 'GET'
  const path = req.path;       // '/api/products'
  const url = req.originalUrl; // '/api/products?page=2&limit=10'
});

app.post('/api/users', (req: Request, res: Response) => {
  // Body (cần express.json() middleware)
  const { name, email } = req.body;

  // URL parameters: /api/users/:id
  // (nếu route là /api/users/:id)
  const { id } = req.params;
});
```

**Response object — gửi phản hồi về client:**

```typescript
app.get('/api/demo', (req: Request, res: Response) => {
  // JSON response (phổ biến nhất)
  res.json({ message: 'Hello' });

  // Với status code
  res.status(201).json({ user: { id: 1, name: 'Huan' } });

  // Send text
  res.send('Plain text response');

  // Set headers
  res.set('X-Custom-Header', 'value');

  // Redirect
  res.redirect('/new-url');
  res.redirect(301, '/permanent-new-url');

  // No content
  res.status(204).send();

  // Download file
  res.download('/path/to/file.pdf');
});
```

**Tổng hợp — route handler hoàn chỉnh:**

```typescript
app.get('/api/users/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    // Validate
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Business logic
    const user = await findUserById(Number(id));
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Success response
    res.json({ data: user });

  } catch (error) {
    next(error);  // Chuyển lỗi cho error handling middleware
  }
});
```

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: Node.js là single-threaded — vậy nó xử lý nhiều request đồng thời bằng cách nào?

**Trả lời:**

Node.js xử lý nhiều request đồng thời nhờ **event loop** và **non-blocking I/O**:

1. **Request đến** → Node nhận request trên main thread
2. **I/O operation** (đọc DB, file, API call) → Node **gửi task cho OS/libuv thread pool** và **không đợi**
3. **Main thread tiếp tục** nhận request khác
4. **Khi I/O hoàn thành** → callback được đưa vào event queue
5. **Event loop** lấy callback từ queue và xử lý trên main thread

```
Main Thread (Event Loop):
  t=0ms:   Nhận Request A → gửi DB query (async) → tiếp tục
  t=1ms:   Nhận Request B → gửi file read (async) → tiếp tục
  t=2ms:   Nhận Request C → tính 2+2 → trả response C ngay
  t=50ms:  DB query xong → chạy callback A → trả response A
  t=80ms:  File read xong → chạy callback B → trả response B
```

**Khi nào Node.js bị chậm?**
- **CPU-intensive tasks** (mã hóa, xử lý ảnh, tính toán nặng) → block main thread → tất cả request bị chờ
- Giải pháp: dùng `worker_threads` hoặc tách CPU-heavy tasks sang service riêng

---

### ❓ Câu 2: Middleware trong Express là gì? Giải thích luồng middleware chain?

**Trả lời:**

**Middleware** là hàm có quyền truy cập vào `request`, `response`, và hàm `next()`. Nó nằm **giữa** việc nhận request và gửi response.

**Luồng middleware chain:**

```
Client Request
    ↓
[express.json()]     → Parse body thành object
    ↓ next()
[cors()]             → Thêm CORS headers
    ↓ next()
[logger()]           → Log request info
    ↓ next()
[authenticate()]     → Check token
    ↓ next() hoặc res.status(401)
[Route Handler]      → Business logic → res.json()
    ↓ (nếu có error)
[errorHandler()]     → Xử lý error → res.status(500)
    ↓
Client Response
```

**3 loại middleware:**
1. **Application-level**: `app.use(middleware)` — áp dụng cho mọi request
2. **Router-level**: `router.use(middleware)` — áp dụng cho group routes
3. **Error-handling**: `(err, req, res, next)` — 4 params, xử lý errors

**Quy tắc quan trọng:**
- Middleware chạy **theo thứ tự** khai báo trong code
- **Phải gọi `next()`** để chuyển sang middleware tiếp theo, hoặc gửi response để kết thúc
- Nếu **không gọi `next()` và không gửi response** → request bị treo (hang)

---

### ❓ Câu 3: So sánh Express.js middleware với middleware trong các framework khác?

**Trả lời:**

| Framework | Middleware Concept | Cách hoạt động |
|-----------|-------------------|---------------|
| **Express (Node.js)** | Middleware function | `(req, res, next) => {}` — chain qua `next()` |
| **Shelf (Dart)** | Middleware | `Handler middleware(Handler inner)` — wrap handler |
| **Django (Python)** | Middleware class | `process_request()` / `process_response()` methods |
| **Spring (Java)** | Filter / Interceptor | `doFilter()` / `preHandle()` + `postHandle()` |
| **Flutter (BLoC)** | Transformer | Stream transformation — tương tự concept nhưng cho events |

**Điểm chung:** Tất cả đều theo pattern **pipeline/chain** — request đi qua nhiều bước xử lý tuần tự trước khi đến logic chính.

---

### ❓ Câu 4: Phân biệt `req.params`, `req.query`, và `req.body`?

**Trả lời:**

```
URL: POST /api/users/42/posts?page=2&sort=date
Body: { "title": "Hello", "content": "World" }
```

| Property | Nguồn | Ví dụ | Giá trị |
|----------|-------|-------|---------|
| `req.params` | URL path parameters (`:param`) | Route: `/users/:id/posts` | `{ id: '42' }` |
| `req.query` | URL query string (`?key=value`) | `?page=2&sort=date` | `{ page: '2', sort: 'date' }` |
| `req.body` | Request body (POST/PUT) | JSON body | `{ title: 'Hello', content: 'World' }` |

**Lưu ý:**
- `req.params` và `req.query` luôn trả về **string** → cần parse nếu muốn number
- `req.body` cần middleware `express.json()` để parse — nếu không sẽ là `undefined`

```typescript
// Parse đúng cách
const id = Number(req.params.id);        // string → number
const page = parseInt(req.query.page as string) || 1;
const { title, content } = req.body;     // đã là object nhờ express.json()
```

---

### ❓ Câu 5: Thiết kế một Express API đơn giản cho quản lý tasks (CRUD)?

**Trả lời:**

```typescript
import express, { Request, Response, NextFunction } from 'express';

const app = express();
app.use(express.json());

// In-memory data store
interface Task {
  id: number;
  title: string;
  done: boolean;
  createdAt: string;
}

let tasks: Task[] = [];
let nextId = 1;

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/tasks — lấy tất cả tasks
app.get('/api/tasks', (req: Request, res: Response) => {
  const { done } = req.query;
  let result = tasks;
  
  if (done !== undefined) {
    result = tasks.filter(t => t.done === (done === 'true'));
  }
  
  res.json({ data: result, total: result.length });
});

// GET /api/tasks/:id — lấy 1 task
app.get('/api/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  res.json({ data: task });
});

// POST /api/tasks — tạo task mới
app.post('/api/tasks', (req: Request, res: Response) => {
  const { title } = req.body;
  
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  const task: Task = {
    id: nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  
  tasks.push(task);
  res.status(201).json({ data: task });
});

// PUT /api/tasks/:id — cập nhật task
app.put('/api/tasks/:id', (req: Request, res: Response) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  const { title, done } = req.body;
  if (title !== undefined) task.title = title;
  if (done !== undefined) task.done = done;
  
  res.json({ data: task });
});

// DELETE /api/tasks/:id — xóa task
app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(index, 1);
  res.status(204).send();
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| Node.js Official - About | https://nodejs.org/en/about |
| Node.js - Event Loop Explained | https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick |
| Express.js Official Guide | https://expressjs.com/en/guide/routing.html |
| Express.js - Using Middleware | https://expressjs.com/en/guide/using-middleware.html |
| MDN - HTTP Request Methods | https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**23/09 - Wed**) bạn sẽ học **REST API Design & Endpoints** — REST resource naming conventions, HTTP status codes, input validation, và consistent error response format. Nắm vững Express routing/middleware hôm nay sẽ giúp bạn thiết kế API endpoints chuẩn RESTful.
