/**
 * Automated Test Runner for Day 22 Express App
 * Chạy bằng: node test-api.js
 */

const http = require('http');

// Chạy server trên port test 3099
process.env.PORT = '3099';
process.env.NODE_ENV = 'test';

// Import app compiled hoặc qua ts-node
require('ts-node').register({ transpileOnly: true });
const app = require('./src/index.ts').default;

const server = http.createServer(app);

async function runTests() {
  await new Promise((resolve) => server.listen(3099, resolve));
  console.log('🧪 Bắt đầu chạy kiểm thử tự động cho Express API...\n');

  const BASE = 'http://localhost:3099';
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      failed++;
    }
  }

  // 1. Test Root
  await test('GET / - Trả về thông tin chào mừng và status online', async () => {
    const res = await fetch(`${BASE}/`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (body.status !== 'online') throw new Error('Body status is not online');
  });

  // 2. Test Event Loop Demo
  await test('GET /api/event-loop-demo - Trả về các bước xử lý Event Loop', async () => {
    const res = await fetch(`${BASE}/api/event-loop-demo`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (!Array.isArray(body.executionSteps) || body.executionSteps.length !== 3) {
      throw new Error('Invalid execution steps');
    }
  });

  // 3. Test Tasks GET
  await test('GET /api/tasks - Lấy danh sách tasks', async () => {
    const res = await fetch(`${BASE}/api/tasks`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (!Array.isArray(body.data)) throw new Error('Data is not array');
  });

  // 4. Test Task POST (Create)
  let createdId = null;
  await test('POST /api/tasks - Tạo task mới thành công (HTTP 201)', async () => {
    const res = await fetch(`${BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Task Test Automated' })
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (!body.data || body.data.title !== 'Task Test Automated') throw new Error('Title mismatch');
    createdId = body.data.id;
  });

  // 5. Test Task GET by ID
  await test('GET /api/tasks/:id - Lấy task theo ID vừa tạo', async () => {
    const res = await fetch(`${BASE}/api/tasks/${createdId}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (body.data.id !== createdId) throw new Error('ID mismatch');
  });

  // 6. Test Task PUT (Update)
  await test('PUT /api/tasks/:id - Cập nhật trạng thái task', async () => {
    const res = await fetch(`${BASE}/api/tasks/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Task Test Automated (Completed)', done: true })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (body.data.done !== true) throw new Error('done flag not updated');
  });

  // 7. Test Task Query Filter
  await test('GET /api/tasks?done=true - Lọc tasks đã xong', async () => {
    const res = await fetch(`${BASE}/api/tasks?done=true`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const body = await res.json();
    if (body.data.some(t => t.done !== true)) throw new Error('Contains non-done tasks');
  });

  // 8. Test Task DELETE
  await test('DELETE /api/tasks/:id - Xóa task (HTTP 204)', async () => {
    const res = await fetch(`${BASE}/api/tasks/${createdId}`, {
      method: 'DELETE'
    });
    if (res.status !== 204) throw new Error(`Status ${res.status}`);
  });

  // 9. Test Auth Middleware - No Token
  await test('GET /api/admin/stats - Từ chối khi không có token (HTTP 401)', async () => {
    const res = await fetch(`${BASE}/api/admin/stats`);
    if (res.status !== 401) throw new Error(`Status was ${res.status}, expected 401`);
  });

  // 10. Test Auth Middleware - Valid Token
  await test('GET /api/admin/stats - Cho phép khi có Bearer token hợp lệ (HTTP 200)', async () => {
    const res = await fetch(`${BASE}/api/admin/stats`, {
      headers: { 'Authorization': 'Bearer secret-token-123' }
    });
    if (res.status !== 200) throw new Error(`Status was ${res.status}, expected 200`);
    const body = await res.json();
    if (!body.systemStats) throw new Error('Missing system stats');
  });

  // 11. Test Error Handling Middleware
  await test('GET /api/simulate-error - Bắt lỗi qua Error Handling Middleware (HTTP 500)', async () => {
    const res = await fetch(`${BASE}/api/simulate-error`);
    if (res.status !== 500) throw new Error(`Status was ${res.status}, expected 500`);
    const body = await res.json();
    if (!body.error) throw new Error('Missing error field in response');
  });

  // 12. Test 404 Route Not Found
  await test('GET /api/unknown-xyz - Trả về 404 cho route không tồn tại', async () => {
    const res = await fetch(`${BASE}/api/unknown-xyz`);
    if (res.status !== 404) throw new Error(`Status was ${res.status}, expected 404`);
  });

  console.log(`\n=========================================`);
  console.log(`📊 Kết quả: ${passed} passed, ${failed} failed`);
  console.log(`=========================================`);

  server.close();
  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Lỗi khi chạy test suite:', err);
  server.close();
  process.exit(1);
});
