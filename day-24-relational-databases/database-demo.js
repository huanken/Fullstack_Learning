/**
 * Day 24: Relational Databases & SQL Queries Demo
 * Minh họa:
 * 1. Thiết kế Schema (Tables, Primary Key, Foreign Key)
 * 2. Quan hệ 1-N (Users -> Orders) & Quan hệ N-N (Orders <-> Products qua OrderItems)
 * 3. Các truy vấn SQL: SELECT, WHERE, INNER JOIN, LEFT JOIN, GROUP BY, Aggregate functions (COUNT, SUM)
 */

class InMemoryDatabase {
  constructor() {
    this.tables = {
      users: [],
      products: [],
      orders: [],
      order_items: []
    };
  }

  seed() {
    // 1. Users table
    this.tables.users = [
      { id: 1, name: 'Nguyễn Sinh Huân', email: 'sinh.huan@example.com', role: 'admin' },
      { id: 2, name: 'Lê Thị Mai', email: 'thanh.mai@example.com', role: 'customer' },
      { id: 3, name: 'Trần Văn Tuấn', email: 'tuan.tran@example.com', role: 'customer' }
    ];

    // 2. Products table
    this.tables.products = [
      { id: 101, name: 'Bàn phím cơ Keychron', price: 1800000, stock: 15 },
      { id: 102, name: 'Chuột không dây Logitech MX Master 3S', price: 2300000, stock: 8 },
      { id: 103, name: 'Màn hình Dell UltraSharp 27"', price: 8500000, stock: 5 },
      { id: 104, name: 'Tai nghe Sony WH-1000XM5', price: 7200000, stock: 12 }
    ];

    // 3. Orders table (1-N với Users qua user_id Foreign Key)
    this.tables.orders = [
      { id: 5001, user_id: 1, order_date: '2026-09-20', status: 'COMPLETED' },
      { id: 5002, user_id: 1, order_date: '2026-09-22', status: 'PENDING' },
      { id: 5003, user_id: 2, order_date: '2026-09-21', status: 'COMPLETED' }
      // User 3 chưa có đơn hàng nào -> Thích hợp để test LEFT JOIN
    ];

    // 4. Order_Items table (Junction Table cho quan hệ N-N giữa Orders và Products)
    this.tables.order_items = [
      { id: 1, order_id: 5001, product_id: 101, quantity: 1, unit_price: 1800000 },
      { id: 2, order_id: 5001, product_id: 102, quantity: 1, unit_price: 2300000 },
      { id: 3, order_id: 5002, product_id: 103, quantity: 2, unit_price: 8500000 },
      { id: 4, order_id: 5003, product_id: 104, quantity: 1, unit_price: 7200000 }
    ];
  }

  // Demo Query 1: INNER JOIN giữa Orders, Users và Products
  queryOrderDetails() {
    return this.tables.orders.map(order => {
      const user = this.tables.users.find(u => u.id === order.user_id);
      const items = this.tables.order_items
        .filter(item => item.order_id === order.id)
        .map(item => {
          const product = this.tables.products.find(p => p.id === item.product_id);
          return {
            productName: product?.name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            subtotal: item.quantity * item.unit_price
          };
        });

      const totalAmount = items.reduce((sum, i) => sum + i.subtotal, 0);

      return {
        orderId: order.id,
        orderDate: order.order_date,
        status: order.status,
        customerName: user?.name,
        customerEmail: user?.email,
        items,
        totalAmount
      };
    });
  }

  // Demo Query 2: LEFT JOIN (Liệt kê tất cả Users kể cả người chưa đặt đơn hàng nào)
  queryUsersWithOrderCounts() {
    return this.tables.users.map(user => {
      const userOrders = this.tables.orders.filter(o => o.user_id === user.id);
      return {
        userId: user.id,
        userName: user.name,
        email: user.email,
        totalOrders: userOrders.length,
        orderIds: userOrders.map(o => o.id)
      };
    });
  }

  // Demo Query 3: GROUP BY & SUM (Thống kê doanh thu theo từng sản phẩm)
  queryProductSalesSummary() {
    return this.tables.products.map(product => {
      const productItems = this.tables.order_items.filter(item => item.product_id === product.id);
      const totalUnitsSold = productItems.reduce((acc, curr) => acc + curr.quantity, 0);
      const totalRevenue = productItems.reduce((acc, curr) => acc + (curr.quantity * curr.unit_price), 0);

      return {
        productId: product.id,
        productName: product.name,
        totalUnitsSold,
        totalRevenue: `${totalRevenue.toLocaleString('vi-VN')} VND`
      };
    });
  }
}

function runDemo() {
  console.log('===============================================================');
  console.log('📦 Day 24: Relational Database Schema & SQL Queries Demonstration');
  console.log('===============================================================\n');

  const db = new InMemoryDatabase();
  db.seed();

  console.log('🔹 1. INNER JOIN Query: Chi tiết Đơn hàng + Khách hàng + Sản phẩm');
  console.log('---------------------------------------------------------------');
  console.log(JSON.stringify(db.queryOrderDetails(), null, 2));

  console.log('\n🔹 2. LEFT JOIN Query: Tất cả Users (Bao gồm user chưa từng mua hàng)');
  console.log('---------------------------------------------------------------');
  console.table(db.queryUsersWithOrderCounts());

  console.log('\n🔹 3. GROUP BY & Aggregation: Báo cáo Doanh thu theo từng Sản phẩm');
  console.log('---------------------------------------------------------------');
  console.table(db.queryProductSalesSummary());

  console.log('\n✅ Demo cơ sở dữ liệu quan hệ hoàn tất!');
}

runDemo();
