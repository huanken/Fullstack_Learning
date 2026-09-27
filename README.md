# 📚 Tổng hợp Demo Projects Thực hành (Learning Review Demos)

Kho lưu trữ source code thực hành tương ứng với tất cả các tài liệu bài học từ ngày **18/09/2026** đến **27/09/2026**.

---

## 🗂️ Danh mục các Thư mục Demo

| Ngày | Thư mục | Chủ đề | Công nghệ / Cách chạy |
|------|---------|--------|-----------------------|
| **18/09** | [`day-18-web-fundamentals/`](./day-18-web-fundamentals/) | HTML Semantics, Box Model & DOM Lab | Mở trực tiếp file `index.html` trên trình duyệt |
| **19/09** | [`day-19-react-fundamentals/`](./day-19-react-fundamentals/) | React JSX, Props vs State, List Keys | Mở trực tiếp file `index.html` trên trình duyệt |
| **20/09** | [`day-20-react-hooks-state/`](./day-20-react-hooks-state/) | `useState`, `useEffect`, Cleanups & Lifting State | Mở trực tiếp file `index.html` trên trình duyệt |
| **21/09** | [`day-21-typescript-api/`](./day-21-typescript-api/) | TypeScript API Consumption & Error Handling | `cd day-21-typescript-api && npm start` |
| **22/09** | ⭐ [`day-22-nodejs-express-basics/`](./day-22-nodejs-express-basics/) | **Node.js Runtime & Express.js with TypeScript** | `cd day-22-nodejs-express-basics && npm run dev` |
| **23/09** | [`day-23-rest-api-design/`](./day-23-rest-api-design/) | RESTful API Design, Nested Routes & Standard Envelopes | `cd day-23-rest-api-design && npm run dev` |
| **24/09** | [`day-24-relational-databases/`](./day-24-relational-databases/) | Relational DB Schema, 1-N, N-N & JOIN Queries | `cd day-24-relational-databases && npm start` |
| **25/09** | [`day-25-nosql-databases/`](./day-25-nosql-databases/) | NoSQL & MongoDB Data Modeling, Embed vs Ref & Aggregation | `cd day-25-nosql-databases && npm start` |
| **26/09** | ⭐ [`day-26-express-database-integration/`](./day-26-express-database-integration/) | **Hands-on: Express REST API + Database Integration** | `cd day-26-express-database-integration && npm run test:api` |
| **27/09** | ⭐ [`day-27-react-api-consumption/`](./day-27-react-api-consumption/) | **Hands-on: React Frontend App Consuming REST API** | `cd day-27-react-api-consumption && npm start` |

---

## 🌟 Trọng tâm: Dự án Demo Ngày 22/09 (Node.js & Express Basics)

Thư mục: `demos/day-22-nodejs-express-basics/`

### 1. Tính năng nổi bật
- **TypeScript & Express Setup**: Cấu hình TypeScript chuẩn với `tsconfig.json`, `ts-node`, `nodemon`.
- **Middleware Chain**:
  - `express.json()` & `express.urlencoded()`
  - `cors()`
  - `logger` (Ghi log method, URL, status code, response time)
  - `authenticate` (Kiểm tra Bearer token cho các route bảo mật)
  - `404 Handler` & `Global errorHandler` (4 tham số: `err, req, res, next`).
- **RESTful CRUD Task Management API**:
  - `GET /api/tasks` (Lọc theo `?done=true/false`, tìm kiếm `?search=keyword`)
  - `GET /api/tasks/:id` (Lấy chi tiết task)
  - `POST /api/tasks` (Tạo task mới kèm validation)
  - `PUT /api/tasks/:id` (Cập nhật task)
  - `DELETE /api/tasks/:id` (Xóa task, trả về HTTP 204 No Content)
- **Event Loop Demonstration**: Endpoint `GET /api/event-loop-demo` minh họa cơ chế Non-blocking I/O và Event Loop trong Node.js.
- **Automated Test Suite**: File `test-api.js` tự động kiểm thử toàn diện 12 test cases.

### 2. Lệnh thực thi nhanh

```bash
cd demos/day-22-nodejs-express-basics

# Cài đặt thư viện
npm install

# Khởi động server (Hot-reload)
npm run dev

# Chạy kiểm thử tự động
npm run test:api

# Build TypeScript sang JavaScript
npm run build
```
