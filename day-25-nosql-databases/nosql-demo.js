/**
 * Day 25 Demo: NoSQL & Document Database Concepts Simulation
 * Demonstrates:
 * 1. Document Data Model (BSON/JSON structure)
 * 2. Embedded Documents vs Document References (1-N & N-N)
 * 3. Mongoose-style Schema Validation & Querying
 * 4. Aggregation Pipeline simulation ($match, $group, $lookup, $sort)
 */

console.log('=== 🍃 DEMO NOSQL & MONGODB CONCEPTS SIMULATION ===\n');

// 1. Simulating MongoDB Collections (Document Store)
const db = {
  users: [
    {
      _id: 'usr_101',
      name: 'Sinh Huan',
      email: 'huan@example.com',
      role: 'admin',
      // EMBEDDED DOCUMENT ARRAY (1 - Few)
      addresses: [
        { street: '123 Pham Van Dong', city: 'Hanoi', isPrimary: true },
        { street: '456 Nguyen Van Linh', city: 'Da Nang', isPrimary: false }
      ],
      createdAt: new Date('2026-09-01T10:00:00Z')
    },
    {
      _id: 'usr_102',
      name: 'Alice Tran',
      email: 'alice@example.com',
      role: 'user',
      addresses: [
        { street: '789 Le Loi', city: 'Ho Chi Minh', isPrimary: true }
      ],
      createdAt: new Date('2026-09-15T14:30:00Z')
    }
  ],

  categories: [
    { _id: 'cat_electronics', name: 'Electronics', description: 'Gadgets and devices' },
    { _id: 'cat_books', name: 'Books', description: 'Tech and programming books' }
  ],

  products: [
    {
      _id: 'prd_1',
      title: 'Mechanical Keyboard Wireless',
      price: 120,
      category_id: 'cat_electronics', // REFERENCE (ObjectId ref)
      tags: ['keyboard', 'wireless', 'rgb'],
      stock: 45
    },
    {
      _id: 'prd_2',
      title: 'Clean Code & Architecture Book',
      price: 45,
      category_id: 'cat_books',
      tags: ['software', 'programming'],
      stock: 100
    },
    {
      _id: 'prd_3',
      title: '4K UltraHD Monitor 27-inch',
      price: 350,
      category_id: 'cat_electronics',
      tags: ['monitor', 'display', '4k'],
      stock: 12
    }
  ],

  orders: [
    {
      _id: 'ord_9001',
      user_id: 'usr_101', // REFERENCED User
      status: 'completed',
      // EMBEDDED Order Items (Denormalized snapshot of products at purchase time)
      items: [
        { product_id: 'prd_1', title: 'Mechanical Keyboard Wireless', price: 120, quantity: 2 },
        { product_id: 'prd_2', title: 'Clean Code & Architecture Book', price: 45, quantity: 1 }
      ],
      totalAmount: 285,
      createdAt: new Date('2026-09-20T08:00:00Z')
    },
    {
      _id: 'ord_9002',
      user_id: 'usr_102',
      status: 'completed',
      items: [
        { product_id: 'prd_3', title: '4K UltraHD Monitor 27-inch', price: 350, quantity: 1 }
      ],
      totalAmount: 350,
      createdAt: new Date('2026-09-22T11:20:00Z')
    }
  ]
};

// -------------------------------------------------------------
// 2. Mongoose-style Population Helper (Simulating $lookup / populate)
// -------------------------------------------------------------
function populateOrder(order) {
  const user = db.users.find(u => u._id === order.user_id);
  const populatedItems = order.items.map(item => {
    const product = db.products.find(p => p._id === item.product_id);
    const category = product ? db.categories.find(c => c._id === product.category_id) : null;
    return {
      ...item,
      productDetails: product ? { ...product, category } : null
    };
  });

  return {
    ...order,
    user: user ? { _id: user._id, name: user.name, email: user.email } : null,
    items: populatedItems
  };
}

console.log('📌 1. POPULATE (REFERENCED DOCUMENT JOIN SIMULATION):');
const sampleOrder = populateOrder(db.orders[0]);
console.log(JSON.stringify(sampleOrder, null, 2));

// -------------------------------------------------------------
// 3. Simulating Aggregation Pipeline ($match -> $unwind -> $group -> $sort)
// -------------------------------------------------------------
console.log('\n📌 2. SIMULATING MONGO AGGREGATION PIPELINE (Revenue by Category):');

function aggregateRevenueByCategory() {
  // Stage 1: $match (Filter completed orders)
  const completedOrders = db.orders.filter(o => o.status === 'completed');

  // Stage 2: $unwind (Flat order items)
  const flatItems = [];
  completedOrders.forEach(order => {
    order.items.forEach(item => {
      flatItems.push(item);
    });
  });

  // Stage 3: $lookup (Attach product & category)
  const enrichedItems = flatItems.map(item => {
    const product = db.products.find(p => p._id === item.product_id);
    return {
      ...item,
      category_id: product ? product.category_id : 'unknown',
      subtotal: item.price * item.quantity
    };
  });

  // Stage 4: $group (Group by category_id & sum totalRevenue, count itemsSold)
  const categoryStats = {};
  enrichedItems.forEach(item => {
    if (!categoryStats[item.category_id]) {
      const cat = db.categories.find(c => c._id === item.category_id);
      categoryStats[item.category_id] = {
        categoryName: cat ? cat.name : item.category_id,
        totalRevenue: 0,
        totalItemsSold: 0
      };
    }
    categoryStats[item.category_id].totalRevenue += item.subtotal;
    categoryStats[item.category_id].totalItemsSold += item.quantity;
  });

  // Stage 5: $sort (Sort by totalRevenue descending)
  const result = Object.values(categoryStats).sort((a, b) => b.totalRevenue - a.totalRevenue);
  return result;
}

const aggResult = aggregateRevenueByCategory();
console.table(aggResult);

// -------------------------------------------------------------
// 4. Embedded vs Reference Summary Comparison Output
// -------------------------------------------------------------
console.log('\n📌 3. DATA MODELING COMPARISON SUMMARY:');
console.log(`
┌───────────────────────┬────────────────────────────────────────┬────────────────────────────────────────┐
│ Pattern               │ Use Cases                              │ Key Advantage                          │
├───────────────────────┼────────────────────────────────────────┼────────────────────────────────────────┤
│ Embedded (Subdoc)     │ Order Items, User Addresses (1-Few)    │ Single I/O query, fast read performance│
│ Referenced (ObjectId) │ Users, Products, Categories (1-Many)   │ Avoids duplication, easy update        │
└───────────────────────┴────────────────────────────────────────┴────────────────────────────────────────┘
`);
