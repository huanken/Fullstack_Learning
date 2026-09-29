import app from './server.js';
import http from 'http';

const PORT = 3009;
let server;

function request(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  server = app.listen(PORT, async () => {
    console.log(`\n======================================================`);
    console.log(`🧪 CHẠY BỘ KIỂM THỬ TỰ ĐỘNG: DAY 28 - JWT AUTHENTICATION`);
    console.log(`======================================================\n`);

    let passed = 0;
    let failed = 0;

    const assert = (description, condition, details = '') => {
      if (condition) {
        console.log(` ✅ PASS: ${description}`);
        passed++;
      } else {
        console.log(` ❌ FAIL: ${description}`);
        if (details) console.log(`    --> Details: ${details}`);
        failed++;
      }
    };

    try {
      // Test 1: Đăng ký user thành công
      const regRes = await request('POST', '/api/auth/register', {}, {
        username: 'sinh_huan',
        email: 'huan@example.com',
        password: 'password123'
      });
      assert('Test 1: Đăng ký tài khoản thành công (HTTP 201)', regRes.status === 201 && regRes.body.success === true);

      // Test 2: Đăng ký trùng email (HTTP 409)
      const dupRes = await request('POST', '/api/auth/register', {}, {
        username: 'sinh_huan2',
        email: 'huan@example.com',
        password: 'password123'
      });
      assert('Test 2: Đăng ký trùng email bị từ chối (HTTP 409)', dupRes.status === 409);

      // Test 3: Đăng nhập sai password (HTTP 401)
      const wrongPassRes = await request('POST', '/api/auth/login', {}, {
        email: 'huan@example.com',
        password: 'wrongpassword'
      });
      assert('Test 3: Đăng nhập sai mật khẩu trả về HTTP 401', wrongPassRes.status === 401);

      // Test 4: Đăng nhập đúng password -> nhận AccessToken & RefreshToken
      const loginRes = await request('POST', '/api/auth/login', {}, {
        email: 'huan@example.com',
        password: 'password123'
      });
      assert('Test 4: Đăng nhập đúng nhận Access Token và Refresh Token', 
        loginRes.status === 200 && 
        !!loginRes.body.data.accessToken && 
        !!loginRes.body.data.refreshToken
      );

      const { accessToken, refreshToken } = loginRes.body.data || {};

      // Test 5: Truy cập Protected route không kèm Bearer Token (HTTP 401)
      const noTokenRes = await request('GET', '/api/auth/profile');
      assert('Test 5: Truy cập route bảo mật không kèm Token trả về HTTP 401', noTokenRes.status === 401);

      // Test 6: Truy cập Protected route với Bearer Token hợp lệ (HTTP 200)
      const profileRes = await request('GET', '/api/auth/profile', {
        'Authorization': `Bearer ${accessToken}`
      });
      assert('Test 6: Truy cập route bảo mật với Access Token hợp lệ thành công', 
        profileRes.status === 200 && profileRes.body.data.profile.email === 'huan@example.com'
      );

      // Test 7: Refresh Access Token với Refresh Token (Token Rotation)
      const refreshRes = await request('POST', '/api/auth/refresh', {}, { refreshToken });
      assert('Test 7: Đổi Access Token mới bằng Refresh Token thành công',
        refreshRes.status === 200 &&
        !!refreshRes.body?.data?.accessToken &&
        !!refreshRes.body?.data?.refreshToken,
        `Status: ${refreshRes.status}, Body: ${JSON.stringify(refreshRes.body)}`
      );

      const newRefreshToken = refreshRes.body?.data?.refreshToken;

      // Test 8: Refresh Token cũ bị vô hiệu hóa sau khi rotation (HTTP 403)
      const reuseOldRefresh = await request('POST', '/api/auth/refresh', {}, { refreshToken });
      assert('Test 8: Refresh Token cũ đã bị xoay (rotated) bị từ chối khi dùng lại (HTTP 403)', reuseOldRefresh.status === 403);

      // Test 9: Đăng xuất & Thu hồi Refresh Token
      const logoutRes = await request('POST', '/api/auth/logout', {}, { refreshToken: newRefreshToken });
      assert('Test 9: Đăng xuất thu hồi Refresh Token thành công', logoutRes.status === 200);

      // Test 10: Dùng Refresh Token đã bị thu hồi để refresh -> thất bại (HTTP 403)
      const useRevokedRes = await request('POST', '/api/auth/refresh', {}, { refreshToken: newRefreshToken });
      assert('Test 10: Dùng Refresh Token đã thu hồi bị trả về HTTP 403', useRevokedRes.status === 403);

    } catch (err) {
      console.error('❌ Lỗi khi thực thi testsuite:', err);
    } finally {
      console.log(`\n------------------------------------------------------`);
      console.log(`📊 Đã hoàn thành: ${passed} PASS, ${failed} FAIL`);
      console.log(`======================================================\n`);
      server.close(() => process.exit(failed > 0 ? 1 : 0));
    }
  });
}

runTests();
