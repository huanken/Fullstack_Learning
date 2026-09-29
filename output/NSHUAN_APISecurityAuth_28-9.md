# 📋 Learning Review — Ngày 28/09/2026 (Thứ Hai)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 28/09/2026 (Mon) |
| **Chủ đề** | **API Security — Authentication (OAuth 2.0 & JWT)** |
| **Session Type** | Self-Study (Theory & Practical Auth) |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **Tìm hiểu chuyên sâu về kiến trúc bảo mật API: Luồng hoạt động OAuth 2.0 (Authorization Code + PKCE, Client Credentials), Cấu trúc chi tiết của JSON Web Token (Header, Payload, Signature), Chiến lược Refresh Token Rotation & Token Revocation, Kỹ thuật lưu trữ Token an toàn trên Client (HttpOnly Cookie vs LocalStorage) để chống lại tấn công XSS và CSRF.**

---

## 🔍 Key Concepts cần nắm vững

### 1. OAuth 2.0 Framework & Flow Types

OAuth 2.0 là một **Authorization Framework** mở cho phép các ứng dụng bên thứ ba (Third-party applications) truy cập tài nguyên của người dùng được lưu trữ trên Resource Server mà không cần biết mật khẩu gốc của người dùng.

```
                  ┌────────────────────────┐
                  │   Resource Owner       │
                  │      (User)            │
                  └──────────▲─────────────┘
                             │ (1) User Approval
                             ▼
┌──────────────┐  (2) Auth Code  ┌────────────────────────┐
│  Client      ├────────────────>│ Authorization Server   │
│  (App Web)   │<────────────────┤  (Auth/Identity Provider│
└──────┬───────┘  (3) Access Token└────────────────────────┘
       │
       │ (4) Request + Bearer Token
       ▼
┌────────────────────────────────────────┐
│ Resource Server (REST API Data Server) │
└────────────────────────────────────────┘
```

#### Các Roles trong OAuth 2.0:
1. **Resource Owner**: Người dùng sở hữu dữ liệu.
2. **Client**: Ứng dụng web/mobile muốn truy cập dữ liệu đại diện cho user.
3. **Authorization Server**: Server xác thực danh tính người dùng và cấp phát Access Token.
4. **Resource Server**: Server lưu trữ dữ liệu (REST API) cần bảo vệ.

#### Các Luồng (Flow Types / Grant Types) Chính:

| Flow Type | Đối tượng sử dụng | Mô tả & Luồng hoạt động | Độ an toàn |
|-----------|-------------------|-------------------------|------------|
| **Authorization Code with PKCE** | SPA (React, Vue), Mobile Apps, Web Fullstack | User đăng nhập trên Auth Server -> Nhận `Authorization Code` -> Client đổi Code lấy Access Token kèm mã hóa PKCE (`code_verifier`). | 🟢 Rất cao (Chuẩn hiện đại cho SPA/Mobile) |
| **Client Credentials** | Server-to-Server (Microservices, Daemon Jobs) | Không có người dùng (User). Server tự dùng `client_id` và `client_secret` để xin Access Token gọi sang API của Service khác. | 🟢 Cao (Dành cho M2M/Backend) |
| **Implicit Grant** | *(Đã lỗi thời / Deprecated)* | Trả Access Token trực tiếp qua URL fragment hash `#access_token=...`. Dễ bị lộ Token qua URL history/referrer. | 🔴 Rất nguy hiểm (Không sử dụng) |
| **Resource Owner Password** | *(Đã lỗi thời / Deprecated)* | Client gửi `username` và `password` trực tiếp tới Auth Server. Phá vỡ bản chất của OAuth 2.0. | 🔴 Nguy hiểm (Chỉ dùng cho Legacy internal) |

---

## 🔑 2. Cấu trúc JSON Web Token (JWT)

JWT là một chuẩn mở ([RFC 7519](https://tools.ietf.org/html/rfc7519)) định nghĩa phương thức truyền tải thông tin nhỏ gọn và tự chứa (self-contained) giữa các bên dưới dạng JSON object.

Dạng chuỗi mã hóa gồm **3 phần phân tách bởi dấu chấm (`.`)**:
`Header.Payload.Signature`

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyXzEwMSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzkwNjk4ODA2LCJleHAiOjE3OTA2OTk3MDZ9.6d_w4_fEr22k9AKGGFDyt6iRdIVhFEmar_nNVLQDXwQ
└───────────────────┬───────────────────┘ └───────────────────────────────┬───────────────────────────────┘ └─────────────────────────┬─────────────────────────┘
                 HEADER                                                PAYLOAD                                                     SIGNATURE
```

### Chi tiết 3 thành phần của JWT:

1. **Header (JSON Base64Url Encoded)**:
   - `alg`: Thuật toán ký chữ ký số (ví dụ: `HS256` - HMAC SHA256 đối xứng, hoặc `RS256` - RSA 256 bất đối xứng).
   - `typ`: Loại token (`JWT`).

2. **Payload (JSON Base64Url Encoded)**:
   Chứa các **Claims** (các tuyên bố về user và metadata). Không lưu trữ mật khẩu hoặc thông tin nhạy cảm ở đây vì Payload chỉ mã hóa Base64 (ai cũng decode được).
   - **Registered Claims**: `iss` (issuer), `sub` (subject), `aud` (audience), `exp` (expiration timestamp), `iat` (issued at).
   - **Custom Claims**: `userId`, `username`, `role`, `email`.

3. **Signature (Chữ ký số xác thực)**:
   Được tạo ra bằng cách lấy Header mã hóa + Payload mã hóa, ký bằng secret key trên server:
   ```javascript
   HMACSHA256(
     base64UrlEncode(header) + "." + base64UrlEncode(payload),
     secret_key
   )
   ```
   - Chữ ký giúp Server kiểm tra tính toàn vẹn (Integrity): Nếu Hacker sửa `role: "user"` thành `role: "admin"` trong Payload, Signature sẽ ngay lập tức không match và Token bị từ chối.

---

## 🔄 3. Token Expiry Strategy, Refresh Tokens & Token Rotation

```
                 ┌────────────────────────────────────────────────────────┐
                 │                JWT LIFECYCLE & ROTATION                │
                 └────────────────────────────────────────────────────────┘

 ┌──────────┐                                                                   ┌──────────┐
 │  Client  │ ── (1) POST /api/auth/login ────────────────────────────────────> │  Server  │
 │          │ <─ (2) Trả về Access Token (15 phút) + Refresh Token (7 ngày) ─── │          │
 │          │                                                                   │          │
 │          │ ── (3) GET /api/data [Bearer Access Token] ─────────────────────> │          │
 │          │ <─ (4) Trả về Dữ liệu HTTP 200 OK ─────────────────────────────── │          │
 │          │                                                                   │          │
 │  (Sau 15m│ ── (5) GET /api/data [Access Token hết hạn] ────────────────────> │          │
 │   hết hạn│ <─ (6) Trả về HTTP 401/403 Token Expired ───────────────────────── │          │
 │   Token) │                                                                   │          │
 │          │ ── (7) POST /api/auth/refresh [Gửi Refresh Token] ──────────────> │          │
 │          │ <─ (8) Thu hồi Refresh Token cũ, cấp cặp Access+Refresh Token mới │          │
 └──────────┘                                                                   └──────────┘
```

### Nguyên tắc thiết kế hai loại Token:
- **Access Token**:
  - Thời hạn sống ngắn (**Short-lived**: 5 - 15 phút).
  - Được gửi kèm theo mọi API request (Header `Authorization: Bearer <access_token>`).
  - Stateless: Server không cần truy vấn Database để kiểm tra, chỉ cần verify signature của JWT.

- **Refresh Token**:
  - Thời hạn sống dài (**Long-lived**: 7 ngày - 30 ngày).
  - Chỉ dùng để xin lại Access Token mới khi Access Token cũ đã hết hạn.
  - Stateful / Whitelisted: Lưu trữ trong DB hoặc Redis (Whitelist / Active Session Store) để có thể **Thu hồi (Revoke)** lập tức khi phát hiện tài khoản bị hack hoặc người dùng bấm Đăng xuất.

### Refresh Token Rotation (Xoay Token):
Mỗi lần Client gửi Refresh Token lên endpoint `/api/auth/refresh`:
1. Server kiểm tra Refresh Token có hợp lệ trong Whitelist không.
2. Server ngay lập tức **xóa (vô hiệu hóa) Refresh Token vừa dùng**.
3. Server cấp **1 Refresh Token mới + 1 Access Token mới** cho Client.
4. **Phát hiện tái sử dụng (Reuse Detection)**: Nếu Hacker lấy trộm Refresh Token cũ và cố tình gửi lại sau khi nó đã được rotate, Server phát hiện ngay bất thường -> lập tức thu hồi toàn bộ Refresh Tokens thuộc về user đó để bảo mật tài khoản.

---

## 🔒 4. Kỹ thuật lưu trữ Token an toàn trên Client (Security Trade-offs)

Lưu trữ Token ở đâu trên Client là một trong những câu hỏi kiến trúc quan trọng nhất trong phát triển Web Full-stack.

| Tiêu chí | `localStorage` / `sessionStorage` | `HttpOnly` Cookie (SameSite=Strict/Lax) |
|----------|------------------------------------|----------------------------------------|
| **Vị trí lưu** | Trình duyệt Web Storage | Cookie trình duyệt do Server set header |
| **Khả năng bị XSS** | 🔴 **Rất nguy hiểm**: Script độc hại (JS) đọc được `localStorage.getItem('token')` | 🟢 **An toàn khỏi XSS**: Javascript không thể đọc Cookie `HttpOnly` |
| **Khả năng bị CSRF** | 🟢 **An toàn khỏi CSRF**: Phải gán header bằng JS thủ công | 🟡 **Có nguy cơ CSRF**: Trình duyệt tự động đính kèm cookie mỗi request |
| **Cách phòng chống** | Lọc dữ liệu đầu vào (Input Sanitization), XSS Content Security Policy (CSP) | Cấu hình `SameSite=Strict/Lax`, dùng `CSRF Anti-Forgery Token` hoặc Double-Submit Cookie |
| **Khuyên dùng** | **Dành cho Access Token ngắn hạn** (hoặc lưu hoàn toàn trong Memory RAM) | **Dành cho Refresh Token dài hạn** |

---

## 🛠️ Thực hành / Hands-on Implementation

Dự án mẫu thực hành hoàn chỉnh triển khai tại: [`demos/day-28-jwt-auth/`](file:///c:/Users/Sinh%20Huan/Desktop/Fullstack_learning/demos/day-28-jwt-auth/)

### Cấu trúc mã nguồn chính (`server.js`):

```javascript
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
app.use(express.json());

const ACCESS_TOKEN_SECRET = 'super-secret-access-key-2026-fullstack';
const REFRESH_TOKEN_SECRET = 'super-secret-refresh-key-2026-fullstack';

const users = [];
let refreshTokens = new Set(); // Store active refresh tokens whitelist

// Middleware xác thực Access Token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, error: 'Access Token Missing' });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid or Expired Token' });
    req.user = user;
    next();
  });
}

// Route Đăng nhập (Issue Token Pair)
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
  }

  const payload = { userId: user.id, username: user.username, role: user.role };
  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id, nonce: `${Date.now()}_${Math.random()}` }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

  refreshTokens.add(refreshToken);

  return res.json({ success: true, data: { accessToken, refreshToken, expiresIn: '15m' } });
});

// Route Refresh Token Rotation
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken || !refreshTokens.has(refreshToken)) {
    return res.status(403).json({ success: false, error: 'Invalid Refresh Token' });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      refreshTokens.delete(refreshToken);
      return res.status(403).json({ success: false, error: 'Expired Refresh Token' });
    }

    refreshTokens.delete(refreshToken); // Rotate: Hủy token cũ

    const newAccessToken = jwt.sign({ userId: decoded.userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ userId: decoded.userId, nonce: `${Date.now()}_${Math.random()}` }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    refreshTokens.add(newRefreshToken);

    return res.json({ success: true, data: { accessToken: newAccessToken, refreshToken: newRefreshToken } });
  });
});
```

---

## 🧪 Kiểm thử & Kết quả

Đã xây dựng bộ kiểm thử tự động `test-jwt.js` và thực thi thành công 10/10 test cases:

```bash
cd demos/day-28-jwt-auth
npm test
```

### Kết quả chạy kiểm thử thực tế:
- ✅ **Test 1**: Đăng ký tài khoản thành công (HTTP 201).
- ✅ **Test 2**: Từ chối đăng ký trùng email (HTTP 409).
- ✅ **Test 3**: Từ chối đăng nhập sai mật khẩu (HTTP 401).
- ✅ **Test 4**: Cấp cặp Access Token (15m) & Refresh Token (7d) khi đăng nhập đúng.
- ✅ **Test 5**: Chặn truy cập Protected Route khi không kèm Bearer Token (HTTP 401).
- ✅ **Test 6**: Cho phép truy cập Protected Route khi gửi Access Token hợp lệ (HTTP 200).
- ✅ **Test 7**: Cấp Access Token mới khi thực hiện Refresh Token request (HTTP 200).
- ✅ **Test 8**: Chặn tái sử dụng Refresh Token cũ sau khi đã được xoay (Token Rotation - HTTP 403).
- ✅ **Test 9**: Đăng xuất thành công và xóa Refresh Token khỏi danh sách whitelist.
- ✅ **Test 10**: Chặn hoàn toàn việc sử dụng Refresh Token đã bị thu hồi (HTTP 403).

---

## 📌 Tổng kết & Core Takeaways

1. **OAuth 2.0 & PKCE**: Sử dụng Authorization Code với PKCE cho tất cả ứng dụng Web SPA & Mobile hiện đại.
2. **Cấu trúc JWT**: JWT mã hóa 3 thành phần Header, Payload, Signature. Chữ ký số đảm bảo dữ liệu không bị thay đổi bất hợp pháp.
3. **Dual Token Pattern**: Kết hợp Access Token ngắn hạn (Stateless, 15 phút) để có hiệu năng cao và Refresh Token dài hạn (Stateful, 7 ngày) được lưu trữ để có khả năng thu hồi quyền truy cập.
4. **Lưu trữ bảo mật**: Lưu Refresh Token trong `HttpOnly`, `SameSite=Strict` Cookie để tránh XSS và phòng chống tấn công CSRF.
