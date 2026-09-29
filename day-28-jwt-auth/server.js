import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 3001;

// Secret keys (In production, use secure environment variables)
const ACCESS_TOKEN_SECRET = 'super-secret-access-key-2026-fullstack';
const REFRESH_TOKEN_SECRET = 'super-secret-refresh-key-2026-fullstack';

// In-memory Database for Demo
const users = [];
// Refresh token store (whitelist / active tokens)
let refreshTokens = new Set();

app.use(cors());
app.use(express.json());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware: Authenticate Access Token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access Token Missing',
      message: 'Vui lòng cung cấp Bearer Access Token trong header Authorization'
    });
  }

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).json({
        success: false,
        error: isExpired ? 'Token Expired' : 'Invalid Token',
        message: isExpired ? 'Access Token đã hết hạn. Vui lòng gửi request refresh token.' : 'Access Token không hợp lệ.'
      });
    }

    req.user = user;
    next();
  });
}

// ------------------- ROUTES -------------------

// 1. POST /api/auth/register - Đăng ký tài khoản
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Username, email và password là bắt buộc'
      });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Email này đã được sử dụng'
      });
    }

    // Hash password với bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: `user_${Date.now()}`,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    return res.status(201).json({
      success: true,
      data: userWithoutPassword,
      message: 'Đăng ký tài khoản thành công!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: error.message });
  }
});

// 2. POST /api/auth/login - Đăng nhập cấp Access Token & Refresh Token
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Email hoặc mật khẩu không chính xác'
      });
    }

    // JWT Payload (Chứa thông tin non-sensitive)
    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    // Tạo Access Token (Ngắn hạn: 15s/15m - ở đây để demo set 15m)
    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    
    // Tạo Refresh Token (Dài hạn: 7d, kèm nonce để đảm bảo tính độc nhất mỗi lần rotate)
    const refreshToken = jwt.sign(
      { userId: user.id, nonce: `${Date.now()}_${Math.random()}` },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    // Thêm refresh token vào whitelist store
    refreshTokens.add(refreshToken);

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
        expiresIn: '15m'
      },
      message: 'Đăng nhập thành công!'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Internal Server Error', message: error.message });
  }
});

// 3. POST /api/auth/refresh - Đổi Access Token mới bằng Refresh Token
app.post('/api/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Vui lòng cung cấp refreshToken'
    });
  }

  if (!refreshTokens.has(refreshToken)) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Refresh Token không hợp lệ hoặc đã bị thu hồi'
    });
  }

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      refreshTokens.delete(refreshToken); // Xóa token hỏng/hết hạn khỏi whitelist
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Refresh Token đã hết hạn hoặc không hợp lệ'
      });
    }

    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User Not Found' });
    }

    // Refresh token rotation: Hủy refresh token cũ, tạo mới 1 cặp tokens
    refreshTokens.delete(refreshToken);

    const newPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const newAccessToken = jwt.sign(newPayload, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign(
      { userId: user.id, nonce: `${Date.now()}_${Math.random()}` },
      REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
    );

    refreshTokens.add(newRefreshToken);

    return res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: '15m'
      },
      message: 'Cấp lại Access Token mới thành công (Token Rotation)!'
    });
  });
});

// 4. POST /api/auth/logout - Thu hồi Refresh Token
app.post('/api/auth/logout', (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    refreshTokens.delete(refreshToken);
  }
  return res.json({
    success: true,
    message: 'Đăng xuất thành công & đã thu hồi Refresh Token!'
  });
});

// 5. GET /api/auth/profile - Protected route yêu cầu JWT Access Token
app.get('/api/auth/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User Not Found' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({
    success: true,
    data: {
      profile: userWithoutPassword,
      tokenClaims: req.user
    },
    message: 'Lấy thông tin cá nhân bảo mật thành công!'
  });
});

// Export app & server starter
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server Auth JWT đang chạy tại: http://localhost:${PORT}`);
  });
}

export default app;
