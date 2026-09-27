# 🚀 Demo: Node.js & Express Basics với TypeScript (Ngày 22/09)

Dự án demo hoàn chỉnh theo nội dung học ngày 22/09 trong file `NSHUAN_NodejsExpressBasics_22-9.md`.

## 📁 Cấu trúc thư mục

```
day-22-nodejs-express-basics/
├── src/
│   ├── index.ts                 # Express setup, middleware chain & routes
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces (Task, User, ApiResponse)
│   ├── middleware/
│   │   ├── logger.ts            # Custom request logger middleware
│   │   ├── auth.ts              # Bearer token authentication middleware
│   │   └── errorHandler.ts      # Global 4-param error handling middleware
│   ├── controllers/
│   │   ├── taskController.ts    # Task CRUD controller (In-memory store)
│   │   └── userController.ts    # User CRUD controller
│   └── routes/
│       ├── taskRoutes.ts        # Task router definitions
│       └── userRoutes.ts        # User router definitions
├── requests.http                # HTTP requests để test bằng REST Client / Thunder Client
├── test-api.js                  # Automated test runner kiểm thử toàn bộ API
├── package.json                 # Scripts và dependencies
├── tsconfig.json                # TypeScript compiler options
└── README.md
```

## 🛠️ Cài đặt & Khởi chạy

```bash
# Di chuyển vào thư mục demo
cd demos/day-22-nodejs-express-basics

# Cài đặt dependencies
npm install

# Chạy môi trường phát triển (Hot reload với nodemon & ts-node)
npm run dev

# Build sang JavaScript
npm run build

# Chạy bản production (sau khi build)
npm start

# Chạy bộ test tự động kiểm thử toàn bộ API
npm run test:api
```

## 🌐 Các Endpoints API Chính

| Method | Endpoint | Mô tả | Tham số / Body |
|--------|----------|-------|----------------|
| `GET` | `/` | Trang chủ & API Health | - |
| `GET` | `/api/event-loop-demo` | Minh họa Event Loop & Non-blocking I/O | - |
| `GET` | `/api/tasks` | Lấy danh sách tasks | Query: `?done=true/false`, `?search=keyword` |
| `GET` | `/api/tasks/:id` | Lấy chi tiết 1 task | URL Param: `:id` |
| `POST` | `/api/tasks` | Tạo task mới | Body: `{ "title": "Tên task" }` |
| `PUT` | `/api/tasks/:id` | Cập nhật task | Body: `{ "title": "...", "done": true }` |
| `DELETE` | `/api/tasks/:id` | Xóa task | URL Param: `:id` (trả về 204 No Content) |
| `GET` | `/api/admin/stats` | Protected Route (Yêu cầu Auth) | Header: `Authorization: Bearer secret-token-123` |
| `GET` | `/api/simulate-error` | Test Global Error Handler | Trả về 500 JSON formatted error |

## 🧪 Middleware Chain đã áp dụng

```
Client Request
     ↓
[express.json()]      (Parse req.body)
     ↓
[express.urlencoded()](Parse urlencoded)
     ↓
[cors()]              (Enable Cross-Origin Resource Sharing)
     ↓
[logger]              (Ghi log method, url, status, duration)
     ↓
[routes]              (Router handlers: /api/tasks, /api/users...)
     ↓
[authenticate]        (Kiểm tra token cho các route admin)
     ↓ (nếu không khớp route)
[404 Not Found]       (Trả về 404 JSON)
     ↓ (nếu có lỗi trong route)
[errorHandler]        (Global 4-param error handler, trả về 500 JSON)
```
