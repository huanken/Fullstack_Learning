# 📋 Learning Review — Ngày 26/09/2026 (Thứ Bảy)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 26/09/2026 (Sat) |
| **Chủ đề** | **Hands-on: REST API with Express.js + Database** |
| **Session Type** | Self-Study (Hands-on Lab) |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **Thực hành xây dựng hoàn chỉnh ứng dụng backend RESTful API bằng Express.js kết nối Database: tổ chức cấu trúc dự án chuẩn Controller - Service - Repository, tích hợp validation middleware, xử lý lỗi toàn cục và xây dựng bộ kiểm thử API tự động.**

---

## 🔍 Key Concepts cần nắm vững

### 1. Kiến trúc Layered Architecture (Controller - Service - Repository)

Một ứng dụng Backend chuyên nghiệp không bao giờ viết logic truy vấn CSDL trực tiếp trong các Router Handler. Thay vào đó, kiến trúc được chia thành các lớp rõ ràng với trách nhiệm riêng biệt (**Separation of Concerns**):

```
                        ┌───────────────────────────────┐
                        │          HTTP Client          │
                        └──────────────┬────────────────┘
                                       │ Request / Response
                                       ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ Express Application Layer                                                     │
│                                                                               │
│   ┌────────────────────┐     ┌────────────────────┐     ┌──────────────────┐  │
│   │   Routes / Router  │ ──> │    Controllers     │ ──> │ Validation & Auth│  │
│   │ (Path Definition)  │     │(HTTP Req/Res Glue) │     │    Middlewares   │  │
│   └────────────────────┘     └─────────┬──────────┘     └──────────────────┘  │
└────────────────────────────────────────┼──────────────────────────────────────┘
                                         │ Calls Business Method
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ Service Layer (Business Logic)                                                │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │ ProductService / UserService                                          │   │
│   │ (Calculations, Validation Rules, Multi-repo coordination, Events)     │   │
│   └───────────────────────────────────┬───────────────────────────────────┘   │
└───────────────────────────────────────┼───────────────────────────────────────┘
                                         │ Calls Data Access Method
                                         ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│ Repository / Data Access Layer (Persistence)                                  │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐   │
│   │ ProductRepository / UserRepository                                    │   │
│   │ (SQL Queries, Mongoose Queries, ORM/ODM Methods, Raw DB Client)       │   │
│   └───────────────────────────────────┬───────────────────────────────────┘   │
└───────────────────────────────────────┼───────────────────────────────────────┘
                                         │ Reads / Writes Data
                                         ▼
                                ┌─────────────────┐
                                │    DATABASE     │
                                │ (SQL / NoSQL)   │
                                └─────────────────┘
```

#### Bảng Phân Tích Trách Nhiệm Chi Tiết:

| Lớp (Layer) | Trách nhiệm chính | Những việc KHÔNG NÊN làm |
|-------------|-------------------|--------------------------|
| **Routes** | Định nghĩa HTTP Path (`/api/v1/products`) & gán Middlewares | Không xử lý logic, không đọc `req.body` |
| **Controllers** | Nhận `req`, extract params/body, gọi Service, trả HTTP Response (`res.status().json()`) | Không viết SQL/DB query, không xử lý business logic phức tạp |
| **Services** | Chứa toàn bộ Business Logic (tính giá, mã hóa pass, kiểm tra điều kiện nghiệp vụ) | Không truy cập trực tiếp `req` hoặc `res` của Express |
| **Repositories** | Thực thi lệnh DB CRUD (Find, Save, Delete, Pagination query) | Không chứa HTTP code hay logic nghiệp vụ ứng dụng |

---

### 2. Tối Ưu Hóa Truy Vấn & Database Connection Pool

- **Connection Pooling**: Giúp mở sẵn một danh sách các kết nối tới Database (pool) để tái sử dụng, tránh việc phải tạo lại kết nối TCP/IP đắt đỏ ở mỗi HTTP request.
- **Async/Await Handling**: Mọi thao tác truy vấn CSDL đều là bất đồng bộ (I/O Bound). Phải dùng `async/await` và bắt lỗi cẩn thận bằng `try/catch` hoặc `asyncHandler`.

```javascript
// Database Client Singleton Connection Pool Example
import { MongoClient } from 'mongodb';

let dbInstance = null;

export async function connectDatabase(uri) {
  if (dbInstance) return dbInstance;
  
  const client = new MongoClient(uri, {
    maxPoolSize: 20,          // Tối đa 20 kết nối trong pool
    minPoolSize: 5,           // Luôn duy trì tối thiểu 5 kết nối
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  dbInstance = client.db('production_db');
  console.log('✅ Connected to Database Cluster successfully');
  return dbInstance;
}
```

---

### 3. Error Handling & Standardized Response Envelope

Tất cả các response từ REST API cần tuân theo một định dạng phản hồi chuẩn (Envelope):

#### Success Response Envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products retrieved successfully",
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 42,
    "totalPages": 5
  }
}
```

#### Error Response Envelope:
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "details": [
      { "field": "price", "message": "Price must be a positive number" }
    ]
  }
}
```

#### Custom AppError Class & Global Error Handler:

```javascript
// utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Phân biệt lỗi dự kiến vs lỗi hệ thống chưa biết
    Error.captureStackTrace(this, this.constructor);
  }
}

// middlewares/errorHandler.js
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  console.error(`[ERROR] ${req.method} ${req.url} - ${err.message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    statusCode,
    error: {
      code: errorCode,
      message: err.message || 'An unexpected error occurred',
      details: err.details || null
    }
  });
}
```

---

## 💻 Thực hành: Hands-on Express API + Database Project

Mã nguồn thực hành hoàn chỉnh được đóng gói tại [`demos/day-26-express-database-integration/`](./demos/day-26-express-database-integration/):

### Cấu trúc dự án:
```
demos/day-26-express-database-integration/
├── src/
│   ├── config/
│   │   └── database.js          # Kết nối Database & Khởi tạo Seed Data
│   ├── errors/
│   │   └── AppError.js          # Custom Operational Error Class
│   ├── middlewares/
│   │   ├── errorHandler.js      # Global Error Middleware
│   │   └── validateRequest.js   # Request Payload Validator
│   ├── models/
│   │   └── productRepository.js # Data Access Layer (CRUD, Filter, Paginate)
│   ├── services/
│   │   └── productService.js    # Business Logic Layer
│   ├── controllers/
│   │   └── productController.js # HTTP Request Handler Layer
│   ├── routes/
│   │   └── productRoutes.js     # API Endpoints Router
│   └── app.js                   # Main Express Application setup
├── test-api.js                  # Automated Test Suite (14 API test cases)
└── package.json
```

### Các API Endpoints đã hỗ trợ:
1. `GET /api/v1/products` — Lấy danh sách sản phẩm (hỗ trợ `?page=1&limit=5&category=Electronics&search=keyboard&sortBy=price&order=desc`)
2. `GET /api/v1/products/:id` — Lấy thông tin chi tiết 1 sản phẩm
3. `POST /api/v1/products` — Tạo sản phẩm mới kèm validation
4. `PUT /api/v1/products/:id` — Cập nhật toàn bộ thông tin sản phẩm
5. `PATCH /api/v1/products/:id/stock` — Cập nhật số lượng tồn kho (Partial update)
6. `DELETE /api/v1/products/:id` — Xóa sản phẩm (Soft Delete)

---

## ❓ Core Q&A / Câu hỏi ôn tập

### ❓ Câu 1: Tại sao việc tách Controller - Service - Repository lại quan trọng trong dự án thực tế?

**Trả lời:**

1. **Maintainability (Dễ bảo trì)**: Mỗi file chỉ làm 1 việc duy nhất (Single Responsibility Principle). Khi cần sửa logic tính thuế sản phẩm, ta chỉ sửa `ProductService`, không chạm vào `Controller` hay `Database`.
2. **Testability (Dễ kiểm thử)**: Ta có thể viết Unit Test cho `ProductService` độc lập bằng cách mock `ProductRepository` mà không cần bật server hay kết nối CSDL thật.
3. **Reusability & Swappability**: Nếu muốn chuyển đổi Database từ MongoDB sang PostgreSQL, ta chỉ cần viết mới lớp `ProductRepositoryPostgres` giữ nguyên toàn bộ `Service` và `Controller`.

---

### ❓ Câu 2: Phân biệt Soft Delete (Xóa mềm) và Hard Delete (Xóa cứng)?

**Trả lời:**

| Tiêu chí | Hard Delete (Xóa cứng) | Soft Delete (Xóa mềm) |
|----------|-------------------------|------------------------|
| **Cơ chế** | Xóa hẳn record khỏi bảng/collection bằng `DELETE FROM` / `remove()` | Thêm field `isDeleted: true` hoặc `deletedAt: Timestamp` |
| **Khả năng khôi phục** | Không thể khôi phục trừ khi khôi phục toàn bộ backup | Rất dễ khôi phục bằng cách set `isDeleted: false` |
| **Data Integrity** | Có thể làm hỏng Foreign Key quan hệ với các bảng khác | Giữ nguyên toàn bộ lịch sử dữ liệu và quan hệ FK |
| **Query Requirement** | Truy vấn đơn giản `SELECT * FROM products` | Mọi truy vấn đọc phải thêm `WHERE is_deleted = false` |
| **Trường hợp áp dụng** | Dữ liệu rác tạm, Tuân thủ luật bảo mật thông tin cá nhân (GDPR) | Đơn hàng, Hóa đơn, Sản phẩm E-commerce, Tài khoản người dùng |

---

### ❓ Câu 3: Cách bắt lỗi bất đồng bộ (Async Errors) trong Express.js 4.x chuẩn xác nhất?

**Trả lời:**

Trong Express 4.x, nếu một hàm `async` ném ra lỗi (throw Error hoặc Promise rejection), Express **không tự động** chuyển sang `next(err)`. Nếu không bắt, ứng dụng sẽ bị treo hoặc crash (`UnhandledPromiseRejection`).

**Giải pháp 1: Dùng hàm bọc (Async Handler Wrapper):**

```javascript
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sử dụng trong Controller:
export const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  res.json({ success: true, data: product });
});
```

---

### ❓ Câu 4: Phân trang (Pagination) chuẩn trong Database và REST API hoạt động như thế nào?

**Trả lời:**

1. **Offset-based Pagination (Phổ biến nhất):**
   - Query Params: `?page=2&limit=10`
   - SQL Formula: `OFFSET = (page - 1) * limit` -> `LIMIT 10 OFFSET 10`
   - Ưu điểm: Đơn giản, nhảy tới trang bất kỳ dễ dàng.
   - Nhược điểm: Chậm ở trang quá lớn (`OFFSET 100000`), dữ liệu trùng/bỏ sót khi có record mới chèn vào giữa.

2. **Cursor-based / Keyset Pagination (Cho danh sách lớn/Real-time Feed):**
   - Query Params: `?limit=10&after=prod_99`
   - SQL Formula: `WHERE id > 'prod_99' ORDER BY id ASC LIMIT 10`
   - Ưu điểm: Hiệu năng cực nhanh, nhất quán dữ liệu khi scroll.
   - Nhược điểm: Không nhảy trực tiếp tới số trang cụ thể được.

---

### ❓ Câu 5: Validation Middleware nên được đặt ở vị trí nào và xử lý ra sao?

**Trả lời:**

Validation Middleware phải được đặt **trước khi request tiến vào Controller**.

```javascript
// Router với Validation Middleware
router.post(
  '/products',
  validateRequest(createProductSchema), // Kiểm tra body trước
  productController.createProduct      // Chỉ chạy nếu body hợp lệ
);
```

Điều này giúp ngăn chặn dữ liệu độc hại/không hợp lệ đi sâu vào hệ thống, tiết kiệm tài nguyên xử lý của Service và Database.

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| Express Production Best Practices | https://expressjs.com/en/advanced/best-practice-performance.html |
| Node.js Clean Architecture Guide | https://github.com/goldbergyoni/nodebestpractices |
| REST API Design - Error Handling | https://restfulapi.net/http-status-codes/ |
| Repository Pattern in Node.js | https://martinfowler.com/eaaCatalog/repository.html |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**27/09 - Sun**) là buổi **Hands-on: React Frontend Consuming API** — Xây dựng giao diện React hoàn chỉnh tích hợp API backend đã phát triển ở bài học này: Custom hooks quản lý API state (Loading, Error, Data), Axios interceptors, Form CRUD với Modal, Optimistic UI updates và Toast notifications.
