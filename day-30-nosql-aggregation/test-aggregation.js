import {
  ordersCollection,
  runAggregationPipeline,
  getCustomerTotalSpendPipeline
} from './aggregation-demo.js';

function runTests() {
  console.log(`\n================================================================`);
  console.log(`🧪 CHẠY BỘ KIỂM THỬ TỰ ĐỘNG: DAY 30 - NOSQL & AGGREGATION PIPELINE`);
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

  // Test 1: $match stage lọc đơn hàng thành công
  const matchResult = runAggregationPipeline(ordersCollection, [{ $match: { status: 'completed' } }]);
  assert('Test 1: Stage $match lọc đúng 3 đơn hàng completed (bỏ qua cancelled)', matchResult.length === 3);

  // Test 2: $unwind stage giải nén mảng items
  const unwindResult = runAggregationPipeline(ordersCollection, [
    { $match: { status: 'completed' } },
    { $unwind: '$items' }
  ]);
  assert('Test 2: Stage $unwind giải nén 3 đơn completed thành 5 sub-items', unwindResult.length === 5);

  // Test 3: $group stage nhóm dữ liệu tính tổng doanh thu theo khách hàng
  const groupResult = runAggregationPipeline(ordersCollection, [
    { $match: { status: 'completed' } },
    { $group: { _id: '$userId', totalSpent: { $sum: '$totalAmount' } } }
  ]);
  const user101Group = groupResult.find(g => g._id === 'u101');
  assert('Test 3: Stage $group tính đúng tổng chi tiêu user u101 là 3600 (2600 + 1000)', user101Group && user101Group.totalSpent === 3600);

  // Test 4: $lookup stage nối bảng (JOIN) giữa orders và users
  const lookupPipeline = getCustomerTotalSpendPipeline();
  const fullResult = runAggregationPipeline(ordersCollection, lookupPipeline);
  assert('Test 4: Stage $lookup kết hợp $unwind và $project trả về thông tin tên và email khách hàng',
    fullResult.length === 2 &&
    fullResult[0].userName === 'Nguyen Van A' &&
    fullResult[0].totalSpent === 3600 &&
    fullResult[1].userName === 'Tran Thi B' &&
    fullResult[1].totalSpent === 2500
  );

  // Test 5: $sort stage sắp xếp giảm dần theo totalSpent
  assert('Test 5: Stage $sort sắp xếp top spender u101 (3600) đứng đầu tiên', fullResult[0].totalSpent > fullResult[1].totalSpent);

  console.log(`\n----------------------------------------------------------------`);
  console.log(`📊 Đã hoàn thành: ${passed} PASS, ${failed} FAIL`);
  console.log(`================================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
