import app from './server.js';
import http from 'http';

const PORT = 3010;
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
    console.log(`\n================================================================`);
    console.log(`🧪 CHẠY BỘ KIỂM THỬ TỰ ĐỘNG: DAY 29 - RBAC & AUTHORIZATION`);
    console.log(`================================================================\n`);

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
      // 1. Tạo tokens thử nghiệm cho 3 roles
      const adminTokenRes = await request('POST', '/api/test-token', {}, { userId: 'u1', role: 'admin', username: 'AdminUser' });
      const managerTokenRes = await request('POST', '/api/test-token', {}, { userId: 'u2', role: 'manager', username: 'ManagerUser' });
      const userTokenRes = await request('POST', '/api/test-token', {}, { userId: 'u3', role: 'user', username: 'RegularUser' });

      const adminToken = adminTokenRes.body.token;
      const managerToken = managerTokenRes.body.token;
      const userToken = userTokenRes.body.token;

      // Test 1: Public endpoint
      const pubRes = await request('GET', '/api/public/health');
      assert('Test 1: Public endpoint có thể truy cập không cần Token (HTTP 200)', pubRes.status === 200);

      // Test 2: Truy cập User Profile không có Token (HTTP 401)
      const profileNoAuth = await request('GET', '/api/user/profile');
      assert('Test 2: Route bảo mật yêu cầu Auth trả về HTTP 401 khi thiếu Token', profileNoAuth.status === 401);

      // Test 3: Truy cập User Profile với User Token (HTTP 200)
      const profileAuth = await request('GET', '/api/user/profile', { 'Authorization': `Bearer ${userToken}` });
      assert('Test 3: Regular User xem được Profile của chính mình (HTTP 200)', profileAuth.status === 200 && profileAuth.body.data.user.role === 'user');

      // Test 4: Regular User truy cập Route Manager Reports -> Bị từ chối (HTTP 403)
      const userReportRes = await request('GET', '/api/manager/reports', { 'Authorization': `Bearer ${userToken}` });
      assert('Test 4: Regular User bị cấm truy cập Manager Reports (HTTP 403 Forbidden)', userReportRes.status === 403);

      // Test 5: Manager truy cập Route Manager Reports -> Thành công (HTTP 200)
      const mgrReportRes = await request('GET', '/api/manager/reports', { 'Authorization': `Bearer ${managerToken}` });
      assert('Test 5: Manager truy cập thành công Manager Reports (HTTP 200)', mgrReportRes.status === 200 && mgrReportRes.body.data.role === 'manager');

      // Test 6: Admin truy cập Route Manager Reports -> Thành công (HTTP 200)
      const adminReportRes = await request('GET', '/api/manager/reports', { 'Authorization': `Bearer ${adminToken}` });
      assert('Test 6: Admin truy cập thành công Manager Reports (HTTP 200)', adminReportRes.status === 200);

      // Test 7: Manager cố xóa User -> Bị từ chối (HTTP 403 - Admin Only)
      const mgrDeleteRes = await request('DELETE', '/api/admin/users/123', { 'Authorization': `Bearer ${managerToken}` });
      assert('Test 7: Manager cố xóa User bị trả về HTTP 403 Forbidden', mgrDeleteRes.status === 403);

      // Test 8: Admin xóa User -> Thành công (HTTP 200)
      const adminDeleteRes = await request('DELETE', '/api/admin/users/123', { 'Authorization': `Bearer ${adminToken}` });
      assert('Test 8: Admin thực hiện xóa User thành công (HTTP 200)', adminDeleteRes.status === 200);

      // Test 9: Fine-grained Permission: Regular User tạo Sản phẩm (cần products:manage) -> HTTP 403
      const userProdRes = await request('POST', '/api/products', { 'Authorization': `Bearer ${userToken}` }, { name: 'Laptop', price: 1000 });
      assert('Test 9: User thiếu quyền products:manage tạo sản phẩm bị HTTP 403', userProdRes.status === 403);

      // Test 10: Fine-grained Permission: Manager tạo Sản phẩm (có products:manage) -> HTTP 201
      const mgrProdRes = await request('POST', '/api/products', { 'Authorization': `Bearer ${managerToken}` }, { name: 'Laptop', price: 1000 });
      assert('Test 10: Manager có quyền products:manage tạo sản phẩm thành công (HTTP 201)', mgrProdRes.status === 201);

    } catch (err) {
      console.error('❌ Lỗi khi thực thi testsuite:', err);
    } finally {
      console.log(`\n----------------------------------------------------------------`);
      console.log(`📊 Đã hoàn thành: ${passed} PASS, ${failed} FAIL`);
      console.log(`================================================================\n`);
      server.close(() => process.exit(failed > 0 ? 1 : 0));
    }
  });
}

runTests();
