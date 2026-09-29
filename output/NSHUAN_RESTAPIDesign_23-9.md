# 📋 Learning Review — Ngày 23/09/2026 (Thứ Tư)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 23/09/2026 (Wed) |
| **Chủ đề** | **REST API Design & Endpoints** |
| **Session Type** | Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **REST API design principles, status codes, error handling; build simple endpoints with Express.js**

---

## 🔍 Key Concepts cần nắm vững

### 1. REST Resource Naming Conventions

- **REST** (Representational State Transfer) là kiến trúc thiết kế API dựa trên **resources**
- Mỗi resource là một entity (user, product, order) được truy cập qua URL
- URL đại diện cho **danh từ** (resource), HTTP method đại diện cho **hành động**

**Quy tắc đặt tên:**

| Quy tắc | ✅ Đúng | ❌ Sai |
|---------|--------|-------|
| Dùng **danh từ số nhiều** | `/api/users` | `/api/user`, `/api/getUsers` |
| Dùng **lowercase + hyphen** | `/api/user-profiles` | `/api/UserProfiles`, `/api/user_profiles` |
| **Không dùng động từ** trong URL | `POST /api/users` | `POST /api/createUser` |
| **Nested resources** cho quan hệ | `/api/users/42/posts` | `/api/getUserPosts?userId=42` |
| **Dùng query params** cho filter/sort | `/api/products?category=shoes&sort=price` | `/api/products/shoes/sortByPrice` |

**CRUD mapping chuẩn:**

```
Resource: Users

GET    /api/users          → Lấy danh sách users (list)
GET    /api/users/:id      → Lấy 1 user (detail)
POST   /api/users          → Tạo user mới (create)
PUT    /api/users/:id      → Cập nhật toàn bộ user (full update)
PATCH  /api/users/:id      → Cập nhật một phần user (partial update)
DELETE /api/users/:id      → Xóa user (delete)
```

**Nested resources:**

```
GET    /api/users/:userId/posts        → Tất cả posts của user
GET    /api/users/:userId/posts/:postId → 1 post cụ thể của user
POST   /api/users/:userId/posts        → Tạo post mới cho user
```

**Versioning:**

```
/api/v1/users    → Version 1
/api/v2/users    → Version 2 (có breaking changes)
```

### 2. HTTP Status Codes

- Status code cho client biết **kết quả** của request
- Chia thành 5 nhóm theo chữ số đầu tiên

**Các status codes quan trọng nhất:**

```
2xx — SUCCESS (thành công)
├── 200 OK              → Request thành công (GET, PUT, PATCH)
├── 201 Created         → Tạo resource mới thành công (POST)
├── 204 No Content      → Thành công nhưng không có body trả về (DELETE)

3xx — REDIRECTION (chuyển hướng)
├── 301 Moved Permanently   → Resource đã chuyển URL vĩnh viễn
├── 304 Not Modified        → Resource chưa thay đổi, dùng cache

4xx — CLIENT ERROR (lỗi từ client)
├── 400 Bad Request         → Request sai format, thiếu field, validation fail
├── 401 Unauthorized        → Chưa đăng nhập / token hết hạn
├── 403 Forbidden           → Đã đăng nhập nhưng không có quyền
├── 404 Not Found           → Resource không tồn tại
├── 409 Conflict            → Xung đột (ví dụ: email đã tồn tại)
├── 422 Unprocessable Entity → Syntax đúng nhưng logic sai
├── 429 Too Many Requests   → Rate limit exceeded

5xx — SERVER ERROR (lỗi từ server)
├── 500 Internal Server Error → Lỗi không xác định từ server
├── 502 Bad Gateway           → Server nhận response lỗi từ upstream
├── 503 Service Unavailable   → Server quá tải hoặc đang bảo trì
```

**Chọn status code đúng:**

| Tình huống | Status Code |
|-----------|------------|
| Lấy danh sách users thành công | `200 OK` |
| Tạo user mới thành công | `201 Created` |
| Xóa user thành công | `204 No Content` |
| Body thiếu field `email` | `400 Bad Request` |
| Token không hợp lệ | `401 Unauthorized` |
| User role không đủ quyền xóa | `403 Forbidden` |
| User ID không tồn tại | `404 Not Found` |
| Email đã được đăng ký | `409 Conflict` |
| Server crash không rõ lý do | `500 Internal Server Error` |

### 3. Input Validation

- **Không bao giờ tin tưởng** dữ liệu từ client — luôn validate trên server
- Validate **trước khi** xử lý business logic
- Trả về lỗi rõ ràng, chỉ ra **field nào sai** và **sai như thế nào**

**Validation thủ công:**

```typescript
interface CreateUserInput {
  name: string;
  email: string;
  age?: number;
  role?: 'user' | 'admin';
}

function validateCreateUser(body: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Required fields
  if (!body.name || typeof body.name !== 'string') {
    errors.name = 'Name is required and must be a string';
  } else if (body.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (body.name.trim().length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.email = 'Invalid email format';
  }

  // Optional fields
  if (body.age !== undefined) {
    if (typeof body.age !== 'number' || body.age < 0 || body.age > 150) {
      errors.age = 'Age must be a number between 0 and 150';
    }
  }

  if (body.role !== undefined) {
    if (!['user', 'admin'].includes(body.role)) {
      errors.role = 'Role must be either "user" or "admin"';
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
```

**Validation với thư viện (Zod — phổ biến nhất với TypeScript):**

```typescript
import { z } from 'zod';

// Định nghĩa schema
const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .toLowerCase(),
  age: z.number()
    .int()
    .min(0)
    .max(150)
    .optional(),
  role: z.enum(['user', 'admin'])
    .default('user'),
});

// Sử dụng trong route
app.post('/api/users', (req, res) => {
  const result = createUserSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().fieldErrors,
    });
  }

  // result.data đã được typed và validated
  const { name, email, age, role } = result.data;
  // ... tạo user
});
```

**Validation middleware — tái sử dụng cho nhiều routes:**

```typescript
import { ZodSchema } from 'zod';

function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      });
    }

    req.body = result.data;  // override body với data đã validated
    next();
  };
}

// Sử dụng
app.post('/api/users', validate(createUserSchema), userController.create);
app.put('/api/users/:id', validate(updateUserSchema), userController.update);
```

### 4. Consistent Error Response Format

- Mọi error response nên có **cùng cấu trúc** — client dễ xử lý
- Bao gồm: status code, error code, message, và chi tiết (nếu có)

**Error response format chuẩn:**

```typescript
// Thống nhất format cho tất cả errors
interface ErrorResponse {
  status: 'error';
  statusCode: number;
  error: {
    code: string;          // Machine-readable: 'VALIDATION_ERROR', 'NOT_FOUND'
    message: string;       // Human-readable: 'User not found'
    details?: Record<string, string>;  // Field-level errors
  };
}

// Thống nhất format cho success
interface SuccessResponse<T> {
  status: 'success';
  statusCode: number;
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

**Ví dụ responses thực tế:**

```json
// ✅ Success — GET /api/users
{
  "status": "success",
  "statusCode": 200,
  "data": [
    { "id": 1, "name": "Huan", "email": "huan@email.com" }
  ],
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}

// ❌ Validation Error — POST /api/users
{
  "status": "error",
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "name": "Name must be at least 2 characters"
    }
  }
}

// ❌ Not Found — GET /api/users/999
{
  "status": "error",
  "statusCode": 404,
  "error": {
    "code": "NOT_FOUND",
    "message": "User with ID 999 not found"
  }
}

// ❌ Unauthorized — missing token
{
  "status": "error",
  "statusCode": 401,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Implement error handling tập trung:**

```typescript
// Custom error class
class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Helper functions
const NotFound = (resource: string) =>
  new AppError(404, 'NOT_FOUND', `${resource} not found`);

const BadRequest = (message: string, details?: Record<string, string>) =>
  new AppError(400, 'BAD_REQUEST', message, details);

const Unauthorized = (message = 'Authentication required') =>
  new AppError(401, 'UNAUTHORIZED', message);

const Forbidden = (message = 'Access denied') =>
  new AppError(403, 'FORBIDDEN', message);

// Trong route handler — throw error
app.get('/api/users/:id', async (req, res, next) => {
  try {
    const user = await db.users.findById(req.params.id);
    if (!user) throw NotFound('User');

    res.json({ status: 'success', statusCode: 200, data: user });
  } catch (error) {
    next(error);
  }
});

// Global error handler — catch tất cả errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      statusCode: err.statusCode,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Unknown error — không expose chi tiết ra ngoài
  console.error('Unexpected error:', err);
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
});
```

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: REST là gì? Kể 5 quy tắc đặt tên endpoint RESTful?

**Trả lời:**

**REST (Representational State Transfer)** là kiến trúc thiết kế API dựa trên các nguyên tắc:
- **Stateless** — mỗi request chứa đầy đủ thông tin, server không lưu session
- **Resource-based** — URL đại diện cho resource (danh từ), không phải hành động
- **HTTP methods** đại diện cho hành động (GET, POST, PUT, DELETE)

**5 quy tắc đặt tên:**

1. **Dùng danh từ số nhiều**: `/api/users` (không phải `/api/user` hay `/api/getUser`)
2. **Dùng lowercase + hyphen**: `/api/user-profiles` (không phải camelCase hay snake_case)
3. **Không dùng động từ**: `DELETE /api/users/42` (không phải `POST /api/deleteUser/42`)
4. **Nested cho quan hệ**: `/api/users/42/posts` (posts thuộc user 42)
5. **Query params cho filter**: `/api/products?category=shoes&sort=price`

---

### ❓ Câu 2: Phân biệt 401 vs 403? Khi nào dùng 400 vs 422?

**Trả lời:**

**401 Unauthorized vs 403 Forbidden:**

| | 401 Unauthorized | 403 Forbidden |
|---|---|---|
| **Nghĩa** | Chưa xác thực (chưa login / token hết hạn) | Đã xác thực nhưng không có quyền |
| **Client nên làm** | Đăng nhập lại, lấy token mới | Không thể retry — cần role/permission khác |
| **Ví dụ** | Request không có Authorization header | User role "viewer" cố xóa user khác |

**400 Bad Request vs 422 Unprocessable Entity:**

| | 400 Bad Request | 422 Unprocessable Entity |
|---|---|---|
| **Nghĩa** | Request sai **format/syntax** | Format đúng nhưng **logic/semantic** sai |
| **Ví dụ** | JSON malformed, thiếu field bắt buộc | Email format đúng nhưng đã tồn tại |
| **Thực tế** | Nhiều team dùng 400 cho cả hai → đơn giản hơn | Chính xác hơn theo spec |

**Khuyến nghị thực tế:** Dùng `400` cho validation errors nói chung, `422` chỉ khi cần phân biệt rõ syntax error vs semantic error.

---

### ❓ Câu 3: Tại sao cần input validation trên server dù frontend đã validate?

**Trả lời:**

**Frontend validation** chỉ để UX tốt hơn — có thể bị **bypass** hoàn toàn:

1. **Postman / cURL** — gửi request trực tiếp, bỏ qua frontend
2. **Browser DevTools** — sửa JavaScript, tắt validation
3. **Proxy tools** — chặn và sửa request trước khi đến server
4. **Automated attacks** — bots gửi request hàng loạt

```
Frontend validation:  UX ✅  Security ❌
Backend validation:   UX ❌  Security ✅
→ Cần CẢ HAI!
```

**Nếu không validate server-side:**
- SQL Injection: `{ "name": "'; DROP TABLE users; --" }`
- XSS: `{ "bio": "<script>steal(cookies)</script>" }`
- Data corruption: `{ "age": -999, "email": "not-an-email" }`

---

### ❓ Câu 4: Thiết kế error response format cho một API — cần những gì?

**Trả lời:**

**Error response tốt cần có:**

```json
{
  "status": "error",
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "email": "Invalid email format",
      "age": "Must be a positive number"
    }
  },
  "timestamp": "2026-09-23T10:30:00Z",
  "path": "/api/users"
}
```

| Field | Mục đích | Bắt buộc? |
|-------|---------|-----------|
| `status` | Phân biệt nhanh success/error | ✅ |
| `statusCode` | HTTP status code trong body | ✅ |
| `error.code` | Machine-readable code cho frontend switch/case | ✅ |
| `error.message` | Human-readable message | ✅ |
| `error.details` | Field-level errors cho form validation | Tùy chọn |
| `timestamp` | Thời điểm xảy ra lỗi — debug | Tùy chọn |
| `path` | Endpoint gây lỗi — debug | Tùy chọn |

**Quy tắc quan trọng:**
- **Không expose stack trace** ra production — chỉ log server-side
- **Không expose database errors** — "Internal server error" là đủ
- **Consistent format** — client chỉ cần 1 error handler cho mọi endpoint

---

### ❓ Câu 5: PUT vs PATCH — khi nào dùng cái nào?

**Trả lời:**

| | PUT | PATCH |
|---|---|---|
| **Ý nghĩa** | **Thay thế toàn bộ** resource | **Cập nhật một phần** resource |
| **Body chứa** | Toàn bộ fields của resource | Chỉ fields cần thay đổi |
| **Idempotent?** | ✅ Gọi nhiều lần = cùng kết quả | ✅ (thường là idempotent) |

**Ví dụ:**

```typescript
// User hiện tại: { id: 1, name: "Huan", email: "huan@email.com", role: "user" }

// PUT /api/users/1 — phải gửi ĐẦY ĐỦ
// Body: { name: "Huan Updated", email: "huan@email.com", role: "user" }
// Nếu quên field → field đó bị mất!

// PATCH /api/users/1 — chỉ gửi field cần sửa
// Body: { name: "Huan Updated" }
// Các field khác giữ nguyên
```

**Thực tế:** Hầu hết API hiện đại dùng **PATCH** cho update vì an toàn hơn. **PUT** dùng khi muốn "replace" hoàn toàn.

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| REST API Tutorial - Naming Conventions | https://restfulapi.net/resource-naming/ |
| MDN - HTTP Status Codes | https://developer.mozilla.org/en-US/docs/Web/HTTP/Status |
| Zod Documentation | https://zod.dev/ |
| Best Practices for REST API Design | https://stackoverflow.blog/2020/03/02/best-practices-for-rest-api-design/ |
| Microsoft - Web API Design | https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**24/09 - Thu**) bạn sẽ học **Relational Databases** — PostgreSQL fundamentals, schema design, joins, indexing, và SQL queries cơ bản. Nắm vững REST API design hôm nay sẽ giúp bạn thiết kế endpoints tương ứng với database operations.
