/**
 * Demo NoSQL Schema Design & MongoDB Aggregation Pipeline ($match, $group, $project, $lookup, $unwind)
 */

// 1. Mock Collections (Documents in NoSQL MongoDB format)
export const usersCollection = [
  { _id: 'u101', name: 'Nguyen Van A', email: 'a@example.com', role: 'customer', registeredAt: '2026-01-15' },
  { _id: 'u102', name: 'Tran Thi B', email: 'b@example.com', role: 'vip', registeredAt: '2026-02-10' },
  { _id: 'u103', name: 'Le Van C', email: 'c@example.com', role: 'customer', registeredAt: '2026-03-05' }
];

export const productsCollection = [
  { _id: 'p1', title: 'MacBook Pro M3', category: 'Electronics', price: 2000 },
  { _id: 'p2', title: 'iPhone 15 Pro', category: 'Electronics', price: 1000 },
  { _id: 'p3', title: 'Ergonomic Chair', category: 'Furniture', price: 300 },
  { _id: 'p4', title: 'Standing Desk', category: 'Furniture', price: 500 }
];

export const ordersCollection = [
  {
    _id: 'ord_1',
    userId: 'u101', // Reference to Users
    status: 'completed',
    orderDate: '2026-09-01',
    // Embedded Document Pattern (Array of Sub-documents)
    items: [
      { productId: 'p1', quantity: 1, unitPrice: 2000 },
      { productId: 'p3', quantity: 2, unitPrice: 300 }
    ],
    totalAmount: 2600
  },
  {
    _id: 'ord_2',
    userId: 'u102',
    status: 'completed',
    orderDate: '2026-09-05',
    items: [
      { productId: 'p2', quantity: 2, unitPrice: 1000 },
      { productId: 'p4', quantity: 1, unitPrice: 500 }
    ],
    totalAmount: 2500
  },
  {
    _id: 'ord_3',
    userId: 'u101',
    status: 'completed',
    orderDate: '2026-09-15',
    items: [
      { productId: 'p2', quantity: 1, unitPrice: 1000 }
    ],
    totalAmount: 1000
  },
  {
    _id: 'ord_4',
    userId: 'u103',
    status: 'cancelled',
    orderDate: '2026-09-20',
    items: [
      { productId: 'p3', quantity: 1, unitPrice: 300 }
    ],
    totalAmount: 300
  }
];

// 2. Engine mô phỏng MongoDB Aggregation Pipeline
export function runAggregationPipeline(initialCollection, pipeline) {
  let docs = JSON.parse(JSON.stringify(initialCollection));

  for (const stage of pipeline) {
    const stageName = Object.keys(stage)[0];
    const stageConfig = stage[stageName];

    switch (stageName) {
      case '$match': {
        docs = docs.filter(doc => {
          for (const key in stageConfig) {
            if (doc[key] !== stageConfig[key]) return false;
          }
          return true;
        });
        break;
      }
      case '$unwind': {
        const fieldPath = stageConfig.replace('$', '');
        const newDocs = [];
        docs.forEach(doc => {
          const arr = doc[fieldPath] || [];
          arr.forEach(item => {
            newDocs.push({
              ...doc,
              [fieldPath]: item
            });
          });
        });
        docs = newDocs;
        break;
      }
      case '$lookup': {
        const { from, localField, foreignField, as } = stageConfig;
        let foreignCollection = [];
        if (from === 'users') foreignCollection = usersCollection;
        if (from === 'products') foreignCollection = productsCollection;
        if (from === 'orders') foreignCollection = ordersCollection;

        docs = docs.map(doc => {
          const matchedForeign = foreignCollection.filter(fDoc => fDoc[foreignField] === doc[localField]);
          return {
            ...doc,
            [as]: matchedForeign
          };
        });
        break;
      }
      case '$group': {
        const idExpr = stageConfig._id; // e.g. "$userId" or "$items.productId"
        const groupKey = idExpr.startsWith('$') ? idExpr.substring(1) : idExpr;
        
        const groups = {};
        docs.forEach(doc => {
          // Resolve key path like "items.productId"
          const keyParts = groupKey.split('.');
          let val = doc;
          for (const p of keyParts) val = val ? val[p] : undefined;

          if (!groups[val]) groups[val] = [];
          groups[val].push(doc);
        });

        const groupResults = [];
        for (const gKey in groups) {
          const gDocs = groups[gKey];
          const resultDoc = { _id: gKey };

          for (const accumField in stageConfig) {
            if (accumField === '_id') continue;
            const accumConfig = stageConfig[accumField];
            const op = Object.keys(accumConfig)[0];
            const targetVal = accumConfig[op];

            if (op === '$sum') {
              if (typeof targetVal === 'number') {
                resultDoc[accumField] = gDocs.length * targetVal;
              } else {
                const fieldTarget = String(targetVal).replace('$', '');
                resultDoc[accumField] = gDocs.reduce((acc, curr) => acc + (curr[fieldTarget] || 0), 0);
              }
            } else if (op === '$avg') {
              const fieldTarget = String(targetVal).replace('$', '');
              const total = gDocs.reduce((acc, curr) => acc + (curr[fieldTarget] || 0), 0);
              resultDoc[accumField] = total / gDocs.length;
            }
          }
          groupResults.push(resultDoc);
        }
        docs = groupResults;
        break;
      }
      case '$project': {
        docs = docs.map(doc => {
          const projected = {};
          for (const field in stageConfig) {
            if (stageConfig[field] === 1) {
              projected[field] = doc[field];
            } else if (typeof stageConfig[field] === 'string' && stageConfig[field].startsWith('$')) {
              const srcPath = stageConfig[field].substring(1).split('.');
              let val = doc;
              for (const p of srcPath) {
                val = val ? val[p] : undefined;
              }
              projected[field] = val;
            }
          }
          return projected;
        });
        break;
      }
      case '$sort': {
        const sortField = Object.keys(stageConfig)[0];
        const order = stageConfig[sortField]; // 1 for ASC, -1 for DESC
        docs.sort((a, b) => {
          if (a[sortField] < b[sortField]) return order === 1 ? -1 : 1;
          if (a[sortField] > b[sortField]) return order === 1 ? 1 : -1;
          return 0;
        });
        break;
      }
    }
  }

  return docs;
}

// ------------------- SPECIFIC AGGREGATION PIPELINE QUERIES -------------------

// Pipeline 1: Thống kê tổng tiền chi tiêu của từng khách hàng (Chỉ tính đơn 'completed')
export function getCustomerTotalSpendPipeline() {
  return [
    { $match: { status: 'completed' } },
    { $group: { _id: '$userId', totalSpent: { $sum: '$totalAmount' }, orderCount: { $sum: 1 } } },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
    { $unwind: '$userInfo' },
    { $project: { userId: '$_id', userName: '$userInfo.name', email: '$userInfo.email', totalSpent: 1, orderCount: 1 } },
    { $sort: { totalSpent: -1 } }
  ];
}

// Executed directly if run
if (process.env.NODE_ENV !== 'test') {
  console.log('📌 CHẠY DEMO AGGREGATION PIPELINE:');
  const pipeline = getCustomerTotalSpendPipeline();
  const results = runAggregationPipeline(ordersCollection, pipeline);
  console.log(JSON.stringify(results, null, 2));
}
