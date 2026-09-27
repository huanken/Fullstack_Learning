/**
 * Automated API Test Suite for Express Database Integration
 */
import app from './src/app.js';

const PORT = 3099;
let server;

async function runTests() {
  server = app.listen(PORT);
  const baseURL = `http://localhost:${PORT}/api/v1`;

  console.log('=== 🧪 STARTING DAY 26 EXPRESS DATABASE API TESTS ===\n');

  let passed = 0;
  let failed = 0;

  async function assert(title, fn) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ [FAIL] ${title}: ${err.message}`);
      failed++;
    }
  }

  // 1. GET /health
  await assert('GET /health returns 200 OK', async () => {
    const res = await fetch(`http://localhost:${PORT}/health`);
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);
  });

  // 2. GET /api/v1/products
  await assert('GET /api/v1/products returns product list and pagination', async () => {
    const res = await fetch(`${baseURL}/products`);
    const json = await res.json();
    if (!json.success || !Array.isArray(json.data) || !json.pagination) {
      throw new Error('Invalid envelope structure');
    }
  });

  // 3. GET /api/v1/products?category=Electronics
  await assert('GET /api/v1/products?category=Electronics filters by category', async () => {
    const res = await fetch(`${baseURL}/products?category=Electronics`);
    const json = await res.json();
    if (json.data.some(p => p.category !== 'Electronics')) {
      throw new Error('Filter by category failed');
    }
  });

  // 4. GET /api/v1/products/prd_101
  await assert('GET /api/v1/products/prd_101 returns product detail', async () => {
    const res = await fetch(`${baseURL}/products/prd_101`);
    const json = await res.json();
    if (json.data.id !== 'prd_101') throw new Error('Product ID mismatch');
  });

  // 5. GET /api/v1/products/non_existing (404)
  await assert('GET non-existing product returns 404 Not Found', async () => {
    const res = await fetch(`${baseURL}/products/non_existing`);
    const json = await res.json();
    if (res.status !== 404 || json.error.code !== 'PRODUCT_NOT_FOUND') {
      throw new Error('Expected 404 error code');
    }
  });

  // 6. POST /api/v1/products (Validation failure)
  await assert('POST /api/v1/products invalid body returns 400 Bad Request', async () => {
    const res = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'A' })
    });
    const json = await res.json();
    if (res.status !== 400 || json.error.code !== 'INVALID_PAYLOAD') {
      throw new Error('Expected 400 validation error');
    }
  });

  // 7. POST /api/v1/products (Create success)
  let createdId = null;
  await assert('POST /api/v1/products creates a new product', async () => {
    const res = await fetch(`${baseURL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Noise Cancelling Headphones',
        category: 'Electronics',
        price: 249.99,
        stock: 30,
        description: 'Active noise cancelling over-ear headphones.'
      })
    });
    const json = await res.json();
    if (res.status !== 201 || !json.data.id) throw new Error('Creation failed');
    createdId = json.data.id;
  });

  // 8. PUT /api/v1/products/:id
  await assert('PUT /api/v1/products updates product info', async () => {
    const res = await fetch(`${baseURL}/products/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Headphones Pro Max', price: 299.99 })
    });
    const json = await res.json();
    if (json.data.price !== 299.99) throw new Error('Update failed');
  });

  // 9. DELETE /api/v1/products/:id (Soft Delete)
  await assert('DELETE /api/v1/products soft deletes product', async () => {
    const res = await fetch(`${baseURL}/products/${createdId}`, { method: 'DELETE' });
    if (res.status !== 200) throw new Error(`Status was ${res.status}`);

    // Verify it is no longer returned
    const checkRes = await fetch(`${baseURL}/products/${createdId}`);
    if (checkRes.status !== 404) throw new Error('Product should be deleted');
  });

  console.log(`\n==========================================`);
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==========================================\n`);

  server.close();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
