# 📚 Tổng hợp Demo Projects Thực hành (Learning Review Demos)

Kho lưu trữ source code thực hành tương ứng với tất cả các tài liệu bài học từ ngày **18/09/2026** đến **30/09/2026**.

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
| **28/09** | ⭐ [`day-28-jwt-auth/`](./day-28-jwt-auth/) | **Hands-on: JWT Authentication & Refresh Token Rotation** | `cd day-28-jwt-auth && npm test` |
| **29/09** | ⭐ [`day-29-rbac-authorization/`](./day-29-rbac-authorization/) | **Hands-on: Role-Based Access Control (RBAC) & Secure API** | `cd day-29-rbac-authorization && npm test` |
| **30/09** | ⭐ [`day-30-nosql-aggregation/`](./day-30-nosql-aggregation/) | **Hands-on: NoSQL Data Modeling & MongoDB Aggregation Pipeline** | `cd day-30-nosql-aggregation && npm test` |

---

## 🌟 Trọng tâm: Các dự án thực hành bảo mật & kiến trúc mới (28/09 - 30/09)

### 1. Day 28: JWT Authentication API (`demos/day-28-jwt-auth/`)
- Triển khai đầy đủ cặp **Access Token (15m)** và **Refresh Token (7d)**.
- Cơ chế **Refresh Token Rotation**: tự động vô hiệu hóa Refresh Token cũ khi đổi token mới.
- Xử lý **Token Revocation (Logout / Blacklist)**.
- Bộ kiểm thử tự động 10/10 test cases (`npm test`).

### 2. Day 29: RBAC & Secure API (`demos/day-29-rbac-authorization/`)
- Middleware phân quyền dựa trên Vai trò (`authorizeRoles('admin', 'manager')`) và Quyền hạn cụ thể (`authorizePermission('products:manage')`).
- Cấu hình OWASP Security Headers (X-Content-Type-Options, X-Frame-Options, XSS protection).
- XSS Input Sanitization middleware tự động làm sạch `req.body`.
- Bộ kiểm thử tự động 10/10 test cases (`npm test`).

### 3. Day 30: NoSQL & Aggregation Pipeline (`demos/day-30-nosql-aggregation/`)
- Mô phỏng engine MongoDB Aggregation Pipeline chạy 6 stage: `$match`, `$group`, `$project`, `$lookup`, `$unwind`, `$sort`.
- So sánh thực nghiệm thiết kế Schema **Embedding** vs **Referencing**.
- Bộ kiểm thử tự động 5/5 test cases (`npm test`).
