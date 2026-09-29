import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = process.env.PORT || 3002;
const JWT_SECRET = 'rbac-secret-key-2026-fullstack';

app.use(cors());
app.use(express.json());

// 🛡️ Security Header Middleware (OWASP Secure Coding Practice)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// 🧹 Simple Input Sanitization Middleware (XSS prevention)
function sanitizeInput(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        // Encode html tags
        req.body[key] = req.body[key].replace(/</g, '&lt;').replace(/>/g, '&gt;');
      }
    }
  }
  next();
}
app.use(sanitizeInput);

// Role & Permission Matrix Configuration
const ROLE_PERMISSIONS = {
  admin: ['users:read', 'users:create', 'users:update', 'users:delete', 'reports:read', 'products:manage'],
  manager: ['users:read', 'reports:read', 'products:manage'],
  user: ['products:read']
};

// Middleware 1: Authentication Token Verification
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Không tìm thấy Access Token. Vui lòng đăng nhập.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Token không hợp lệ hoặc đã hết hạn.'
      });
    }
    req.user = user;
    next();
  });
}

// Middleware 2: Role-Based Authorization Check
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Không xác định được Vai trò (Role) người dùng.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Access Denied',
        message: `Tài khoản vai trò '${req.user.role}' không có quyền truy cập endpoint này. Yêu cầu quyền: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

// Middleware 3: Fine-grained Permission-Based Authorization Check
export function authorizePermission(requiredPermission) {
  return (req, res, next) => {
    const userRole = req.user?.role;
    const permissions = ROLE_PERMISSIONS[userRole] || [];

    if (!permissions.includes(requiredPermission)) {
      return res.status(403).json({
        success: false,
        error: 'Permission Denied',
        message: `Bạn thiếu quyền cụ thể '${requiredPermission}' để thực hiện thao tác này.`
      });
    }

    next();
  };
}

// ------------------- ENDPOINTS -------------------

// Helper endpoint: Tạo token cho testing với các roles khác nhau
app.post('/api/test-token', (req, res) => {
  const { userId, role, username } = req.body;
  if (!role || !['admin', 'manager', 'user'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Role phải là admin, manager hoặc user' });
  }

  const token = jwt.sign({ userId: userId || 'test_123', role, username: username || 'User' }, JWT_SECRET, { expiresIn: '1h' });
  return res.json({ success: true, token, role });
});

// Public Endpoint
app.get('/api/public/health', (req, res) => {
  res.json({ success: true, status: 'Healthy', timestamp: new Date().toISOString() });
});

// Protected Endpoint - Tất cả User đã đăng nhập
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      permissions: ROLE_PERMISSIONS[req.user.role] || []
    },
    message: 'Profile thông tin người dùng'
  });
});

// Manager + Admin Endpoint - Xem báo cáo
app.get('/api/manager/reports', authenticateToken, authorizeRoles('manager', 'admin'), (req, res) => {
  res.json({
    success: true,
    data: {
      monthlyRevenue: 150000000,
      totalOrders: 420,
      generatedBy: req.user.username,
      role: req.user.role
    },
    message: 'Báo cáo doanh thu chỉ dành cho Manager & Admin'
  });
});

// Admin-Only Endpoint - Xóa người dùng
app.delete('/api/admin/users/:id', authenticateToken, authorizeRoles('admin'), (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    message: `[ADMIN ONLY] Đã xóa thành công người dùng id=${id}`,
    deletedBy: req.user.username
  });
});

// Fine-grained Permission Endpoint - Quản lý sản phẩm (Cần quyền products:manage)
app.post('/api/products', authenticateToken, authorizePermission('products:manage'), (req, res) => {
  const { name, price } = req.body;
  res.status(201).json({
    success: true,
    data: { id: `prod_${Date.now()}`, name, price, createdBy: req.user.username },
    message: 'Tạo sản phẩm thành công với quyền products:manage'
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Server RBAC Authorization đang chạy tại: http://localhost:${PORT}`);
  });
}

export default app;
