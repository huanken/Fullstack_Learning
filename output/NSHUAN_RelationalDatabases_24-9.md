# 📋 Learning Review — Ngày 24/09/2026 (Thứ Năm)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 24/09/2026 (Thu) |
| **Chủ đề** | **Relational Databases** |
| **Session Type** | Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **PostgreSQL fundamentals: schema design, joins, indexing, basic SQL queries**

---

## 🔍 Key Concepts cần nắm vững

### 1. SQL Basics (SELECT / INSERT / UPDATE / DELETE)

- **SQL** (Structured Query Language) là ngôn ngữ truy vấn dữ liệu cho **relational databases**
- Relational DB lưu trữ dữ liệu trong **tables** (bảng) với **rows** (hàng) và **columns** (cột)
- PostgreSQL là một trong các RDBMS phổ biến nhất (cùng với MySQL, SQL Server)

**Tạo bảng:**

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,            -- auto-increment integer
  name        VARCHAR(100) NOT NULL,          -- string, tối đa 100 ký tự, bắt buộc
  email       VARCHAR(255) UNIQUE NOT NULL,   -- unique constraint
  role        VARCHAR(20) DEFAULT 'user',     -- giá trị mặc định
  age         INTEGER CHECK (age >= 0),       -- check constraint
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  content     TEXT,                            -- text không giới hạn
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  published   BOOLEAN DEFAULT false,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**CRUD operations:**

```sql
-- ===== INSERT — Thêm dữ liệu =====

-- Thêm 1 row
INSERT INTO users (name, email, role)
VALUES ('Huan', 'huan@email.com', 'admin');

-- Thêm nhiều rows
INSERT INTO users (name, email) VALUES
  ('Alice', 'alice@email.com'),
  ('Bob', 'bob@email.com'),
  ('Charlie', 'charlie@email.com');

-- Insert và trả về row vừa tạo (PostgreSQL)
INSERT INTO users (name, email)
VALUES ('David', 'david@email.com')
RETURNING id, name, email;


-- ===== SELECT — Truy vấn dữ liệu =====

-- Lấy tất cả
SELECT * FROM users;

-- Lấy các cột cụ thể
SELECT id, name, email FROM users;

-- Điều kiện WHERE
SELECT * FROM users WHERE role = 'admin';
SELECT * FROM users WHERE age >= 18 AND is_active = true;
SELECT * FROM users WHERE name LIKE '%uan%';       -- chứa 'uan'
SELECT * FROM users WHERE email LIKE '%@gmail.com'; -- kết thúc bằng @gmail.com
SELECT * FROM users WHERE role IN ('admin', 'moderator');
SELECT * FROM users WHERE age BETWEEN 18 AND 30;
SELECT * FROM users WHERE age IS NULL;

-- Sắp xếp
SELECT * FROM users ORDER BY created_at DESC;       -- mới nhất trước
SELECT * FROM users ORDER BY name ASC, age DESC;    -- tên A-Z, cùng tên thì tuổi giảm dần

-- Phân trang
SELECT * FROM users ORDER BY id LIMIT 20 OFFSET 40; -- page 3 (skip 40, lấy 20)

-- Đếm
SELECT COUNT(*) FROM users WHERE is_active = true;

-- Aggregate functions
SELECT role, COUNT(*) as count FROM users GROUP BY role;
SELECT role, AVG(age) as avg_age FROM users GROUP BY role HAVING AVG(age) > 25;


-- ===== UPDATE — Cập nhật dữ liệu =====

-- Cập nhật 1 row
UPDATE users SET name = 'Huan Updated', updated_at = CURRENT_TIMESTAMP
WHERE id = 1;

-- Cập nhật nhiều rows
UPDATE users SET is_active = false
WHERE created_at < '2026-01-01';

-- Update và trả về (PostgreSQL)
UPDATE users SET role = 'admin' WHERE id = 1 RETURNING *;


-- ===== DELETE — Xóa dữ liệu =====

-- Xóa theo điều kiện
DELETE FROM users WHERE id = 5;

-- Xóa và trả về row bị xóa
DELETE FROM users WHERE id = 5 RETURNING *;

-- ⚠️ XÓA TẤT CẢ — cẩn thận!
DELETE FROM users;  -- xóa hết rows (giữ table)
TRUNCATE TABLE users; -- xóa hết rows + reset ID counter
```

### 2. Schema Design

- **Schema** là bản thiết kế cấu trúc database: tables, columns, relationships, constraints
- Thiết kế schema tốt giúp: query hiệu quả, data integrity, dễ mở rộng

**Nguyên tắc thiết kế:**

```
1. Mỗi table đại diện cho 1 entity (users, products, orders)
2. Mỗi row là 1 instance của entity
3. Mỗi column là 1 attribute
4. Tránh lưu dữ liệu trùng lặp → Normalization
5. Đặt constraints để đảm bảo data integrity
```

**Ví dụ — E-commerce schema:**

```sql
-- Users table
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(20) DEFAULT 'customer',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  category_id INTEGER REFERENCES categories(id),
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) UNIQUE NOT NULL,
  slug  VARCHAR(100) UNIQUE NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  status      VARCHAR(20) DEFAULT 'pending',  -- pending, confirmed, shipped, delivered
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items (many-to-many: orders ↔ products)
CREATE TABLE order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  unit_price  DECIMAL(10, 2) NOT NULL,  -- giá tại thời điểm mua
  UNIQUE(order_id, product_id)          -- mỗi product chỉ xuất hiện 1 lần trong 1 order
);
```

**Các loại quan hệ:**

| Quan hệ | Ví dụ | Cách implement |
|---------|-------|---------------|
| **One-to-One** | User ↔ Profile | Foreign key + UNIQUE constraint |
| **One-to-Many** | User → nhiều Posts | Foreign key ở bảng "many" |
| **Many-to-Many** | Orders ↔ Products | Bảng trung gian (junction table) |

### 3. Primary Keys & Foreign Keys

**Primary Key (PK):**
- Định danh **duy nhất** cho mỗi row trong table
- **Không được NULL**, **không được trùng**
- Thường dùng `SERIAL` (auto-increment) hoặc `UUID`

```sql
-- Auto-increment integer (phổ biến, đơn giản)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,  -- 1, 2, 3, 4, ...
  name VARCHAR(100)
);

-- UUID (phổ biến cho distributed systems)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),  -- 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  name VARCHAR(100)
);
```

**Foreign Key (FK):**
- Liên kết giữa 2 tables — đảm bảo **referential integrity**
- FK phải trỏ đến PK hoặc UNIQUE column của table khác

```sql
CREATE TABLE posts (
  id       SERIAL PRIMARY KEY,
  title    VARCHAR(200) NOT NULL,
  user_id  INTEGER NOT NULL REFERENCES users(id),  -- FK → users.id
  --                         ↑ nếu user_id = 999 mà không có users.id = 999 → lỗi
);

-- ON DELETE behavior
REFERENCES users(id) ON DELETE CASCADE    -- xóa user → xóa tất cả posts của user
REFERENCES users(id) ON DELETE SET NULL   -- xóa user → posts.user_id = NULL
REFERENCES users(id) ON DELETE RESTRICT   -- không cho xóa user nếu còn posts (mặc định)
```

### 4. Joins — Kết hợp dữ liệu từ nhiều bảng

```sql
-- ===== INNER JOIN — chỉ lấy rows khớp ở CẢ HAI bảng =====
SELECT users.name, posts.title, posts.created_at
FROM users
INNER JOIN posts ON users.id = posts.user_id;
-- User không có post → không hiện
-- Post không có user → không hiện

-- ===== LEFT JOIN — lấy TẤT CẢ từ bảng trái + khớp từ bảng phải =====
SELECT users.name, posts.title
FROM users
LEFT JOIN posts ON users.id = posts.user_id;
-- User không có post → vẫn hiện (posts.title = NULL)
-- Dùng khi muốn liệt kê tất cả users, kể cả chưa có post

-- ===== RIGHT JOIN — lấy TẤT CẢ từ bảng phải + khớp từ bảng trái =====
-- Ít dùng — thường đổi thứ tự bảng và dùng LEFT JOIN

-- ===== FULL OUTER JOIN — lấy TẤT CẢ từ cả hai bảng =====
SELECT users.name, posts.title
FROM users
FULL OUTER JOIN posts ON users.id = posts.user_id;
-- Hiện tất cả users + tất cả posts, NULL cho phần không khớp
```

**Hình dung bằng Venn diagram:**

```
INNER JOIN:        LEFT JOIN:         RIGHT JOIN:       FULL OUTER JOIN:
  ┌───┬───┐         ┌───┬───┐         ┌───┬───┐         ┌───┬───┐
  │   │ ■ │         │ ■ │ ■ │         │   │ ■ │         │ ■ │ ■ │
  │ A │   │ B       │ A │   │ B       │ A │   │ B       │ A │   │ B
  │   │ ■ │         │ ■ │ ■ │         │   │ ■ │         │ ■ │ ■ │
  └───┴───┘         └───┴───┘         └───┴───┘         └───┴───┘
  Chỉ phần chung    Toàn bộ A         Toàn bộ B         Toàn bộ A+B
```

**Ví dụ thực tế — Query phức tạp:**

```sql
-- Lấy tất cả orders với thông tin user và products
SELECT
  o.id AS order_id,
  u.name AS customer_name,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) AS item_total,
  o.status,
  o.created_at AS order_date
FROM orders o
INNER JOIN users u ON o.user_id = u.id
INNER JOIN order_items oi ON o.id = oi.order_id
INNER JOIN products p ON oi.product_id = p.id
WHERE o.status = 'delivered'
ORDER BY o.created_at DESC;

-- Đếm số posts của mỗi user (kể cả user chưa có post)
SELECT
  u.id,
  u.name,
  COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name
ORDER BY post_count DESC;
```

### 5. Indexing — Tăng tốc truy vấn

- **Index** giống mục lục sách — giúp database tìm dữ liệu **nhanh hơn** mà không cần scan toàn bộ table
- Không có index → **Full Table Scan** (đọc từng row) → chậm với data lớn
- Có index → **Index Scan** (nhảy đến vị trí cần thiết) → nhanh hơn nhiều

```sql
-- Tạo index trên column thường query
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Composite index (nhiều columns)
CREATE INDEX idx_products_category_price ON products(category_id, price);
-- Tối ưu cho: WHERE category_id = X AND price > Y

-- Unique index (tự động tạo khi có UNIQUE constraint)
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

**Khi nào tạo index:**

| ✅ Nên tạo index | ❌ Không nên tạo index |
|---|---|
| Columns trong `WHERE` thường xuyên | Columns ít khi query |
| Columns trong `JOIN` (`ON a.id = b.user_id`) | Bảng nhỏ (< vài trăm rows) |
| Columns trong `ORDER BY` | Columns thay đổi rất thường xuyên |
| Foreign key columns | Columns có rất ít giá trị khác nhau (boolean) |

**Trade-off:**

```
✅ Ưu điểm: SELECT nhanh hơn
❌ Nhược điểm: INSERT/UPDATE/DELETE chậm hơn (phải cập nhật index)
❌ Nhược điểm: Tốn thêm disk space
→ Chỉ tạo index cho columns thực sự cần thiết
```

**Kiểm tra query performance:**

```sql
-- EXPLAIN cho biết database sẽ thực hiện query như thế nào
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'huan@email.com';

-- Kết quả:
-- Seq Scan (không index)  → cost: 1000ms
-- Index Scan (có index)   → cost: 0.5ms
```

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: Relational Database là gì? So sánh với NoSQL?

**Trả lời:**

**Relational Database (RDBMS):**
- Dữ liệu lưu trong **tables** (bảng) với schema cố định
- Quan hệ giữa tables qua **foreign keys**
- Dùng **SQL** để truy vấn
- Đảm bảo **ACID** (Atomicity, Consistency, Isolation, Durability)

| Tiêu chí | Relational (PostgreSQL, MySQL) | NoSQL (MongoDB, Redis) |
|----------|-------------------------------|----------------------|
| **Cấu trúc** | Bảng cố định, schema rõ ràng | Linh hoạt, schema-less |
| **Quan hệ** | Mạnh — JOIN, foreign keys | Yếu — thường embed hoặc reference |
| **Query** | SQL (chuẩn hóa) | Ngôn ngữ riêng mỗi DB |
| **Scale** | Vertical (nâng server) | Horizontal (thêm server) |
| **Phù hợp cho** | Data có quan hệ phức tạp, cần consistency | Data linh hoạt, cần scale nhanh |
| **Ví dụ** | E-commerce, banking, ERP | Real-time apps, CMS, analytics |

---

### ❓ Câu 2: Giải thích các loại JOIN bằng ví dụ cụ thể?

**Trả lời:**

Giả sử có 2 bảng:

```
users:              posts:
| id | name  |      | id | title    | user_id |
|----|-------|      |----|----------|---------|
| 1  | Alice |      | 1  | Post A   | 1       |
| 2  | Bob   |      | 2  | Post B   | 1       |
| 3  | Charlie|     | 3  | Post C   | 4       | ← user_id=4 không tồn tại
```

| JOIN Type | Kết quả | Giải thích |
|-----------|---------|-----------|
| **INNER JOIN** | Alice-PostA, Alice-PostB | Chỉ rows khớp cả 2 bảng. Bob không có post → không hiện. PostC user_id=4 không có user → không hiện |
| **LEFT JOIN** | Alice-PostA, Alice-PostB, Bob-NULL, Charlie-NULL | Tất cả users, kể cả chưa có post (post columns = NULL) |
| **RIGHT JOIN** | Alice-PostA, Alice-PostB, NULL-PostC | Tất cả posts, kể cả user không tồn tại |
| **FULL OUTER** | Alice-PostA, Alice-PostB, Bob-NULL, Charlie-NULL, NULL-PostC | Tất cả từ cả 2 bảng |

---

### ❓ Câu 3: Index là gì? Khi nào tạo index và khi nào không nên?

**Trả lời:**

**Index** là cấu trúc dữ liệu phụ (thường là **B-tree**) giúp database tìm rows nhanh hơn mà không cần quét toàn bộ bảng.

**Tạo index khi:**
- Column thường xuyên dùng trong `WHERE`, `JOIN ON`, `ORDER BY`
- Bảng có **nhiều rows** (hàng nghìn trở lên)
- Query cần trả kết quả nhanh

**Không nên tạo khi:**
- Bảng nhỏ — full scan cũng nhanh
- Column hiếm khi query
- Column thay đổi rất thường xuyên (INSERT/UPDATE nhiều)
- Column có rất ít giá trị distinct (ví dụ: boolean chỉ có true/false)

**Analogy đời thực:**

```
Sách 10 trang    → Đọc lướt nhanh hơn tra mục lục → Không cần index
Sách 1000 trang  → Tra mục lục tiết kiệm thời gian → Cần index
Sách cập nhật liên tục → Phải sửa mục lục mỗi lần → Index tốn chi phí maintain
```

---

### ❓ Câu 4: Viết SQL query cho các yêu cầu thực tế?

**Trả lời:**

```sql
-- 1. Tìm 5 users đăng ký gần nhất
SELECT id, name, email, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Đếm số orders theo status
SELECT status, COUNT(*) AS total
FROM orders
GROUP BY status
ORDER BY total DESC;

-- 3. Tìm users có hơn 10 posts
SELECT u.id, u.name, COUNT(p.id) AS post_count
FROM users u
INNER JOIN posts p ON u.id = p.user_id
GROUP BY u.id, u.name
HAVING COUNT(p.id) > 10
ORDER BY post_count DESC;

-- 4. Top 5 products bán chạy nhất
SELECT p.name, SUM(oi.quantity) AS total_sold
FROM products p
INNER JOIN order_items oi ON p.id = oi.product_id
INNER JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 5;

-- 5. Doanh thu theo tháng
SELECT
  DATE_TRUNC('month', created_at) AS month,
  COUNT(*) AS order_count,
  SUM(total_amount) AS revenue
FROM orders
WHERE status = 'delivered'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

---

### ❓ Câu 5: ACID trong database là gì?

**Trả lời:**

| Tính chất | Ý nghĩa | Ví dụ |
|-----------|---------|-------|
| **A**tomicity | Transaction chạy **toàn bộ hoặc không gì cả** | Chuyển tiền: trừ tài khoản A + cộng tài khoản B → nếu 1 bước fail thì rollback cả 2 |
| **C**onsistency | Database luôn ở trạng thái **hợp lệ** | Số dư không được âm, email phải unique → constraint đảm bảo |
| **I**solation | Các transactions **không ảnh hưởng** lẫn nhau | 2 người cùng mua sản phẩm cuối → chỉ 1 người mua được |
| **D**urability | Dữ liệu **không mất** sau khi commit | Server crash sau commit → restart vẫn còn data |

```sql
-- Ví dụ transaction: chuyển 100$ từ user 1 → user 2
BEGIN;

UPDATE accounts SET balance = balance - 100 WHERE user_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE user_id = 2;

-- Nếu cả 2 thành công
COMMIT;

-- Nếu có lỗi
ROLLBACK;  -- quay lại trạng thái trước BEGIN
```

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| PostgreSQL Official Tutorial | https://www.postgresql.org/docs/current/tutorial.html |
| SQLBolt - Interactive SQL Tutorial | https://sqlbolt.com/ |
| PostgreSQL Exercises | https://pgexercises.com/ |
| Use The Index, Luke - Indexing Guide | https://use-the-index-luke.com/ |
| MDN - Server-side databases | https://developer.mozilla.org/en-US/docs/Learn/Server-side/First_steps/Databases |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**25/09 - Fri**) là buổi **Review Meeting + NoSQL Databases** — 30 phút review với mentor về các chủ đề Tue–Thu, sau đó học MongoDB collections/documents, schema design trade-offs (embed vs reference), và basic CRUD với Mongoose. Kiến thức relational DB hôm nay sẽ giúp bạn so sánh và hiểu khi nào dùng SQL vs NoSQL.
