# 📋 Learning Review — Ngày 25/09/2026 (Thứ Sáu)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 25/09/2026 (Fri) |
| **Chủ đề** | **Review Meeting + NoSQL Databases** |
| **Session Type** | Review (30 min) + Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **Review 30 phút với Mentor các chủ đề 22–24/09 (Node.js/Express, REST API, SQL) + Tìm hiểu NoSQL Databases: MongoDB collections & documents, schema design trade-offs (Embed vs Reference), và thao tác CRUD cơ bản với Mongoose/MongoDB Driver.**

---

## 🤝 Summary: Buổi Review 30 Phút Với Mentor

### Nội dung đã được Mentor đánh giá & phản hồi:
1. **Node.js & Express Basics (22/09)**:
   - Nắm vững cơ chế **Event Loop** (Call Stack, Task Queue, Microtask Queue). Tránh các tác vụ blocking I/O trên Main Thread.
   - Kiến trúc **Middleware Chain** hoạt động theo mô hình *Onion / Pipe pattern*. Cần đặt `errorHandler` ở cuối cùng của router stack.
2. **REST API Design (23/09)**:
   - Đặt tên endpoint nhất quán bằng danh từ số nhiều (`/api/v1/products`).
   - Sử dụng chuẩn HTTP Status Codes: `200 OK`, `201 Created`, `204 No Content`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.
   - Chuẩn hóa format response JSON envelope (`{ success, data, error, pagination }`).
3. **Relational Databases & SQL (24/09)**:
   - Hiểu rõ 3 dạng quan hệ `1-1`, `1-N`, `N-N`. Sử dụng Foreign Keys & Primary Keys để đảm bảo **Data Integrity**.
   - Cần phân biệt rõ các loại JOIN: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN`.
   - Nắm vững tính chất **ACID** (Atomicity, Consistency, Isolation, Durability) trong RDBMS.

---

## 🔍 Key Concepts cần nắm vững

### 1. NoSQL & MongoDB Overview

- **NoSQL** (Not Only SQL) là lớp các hệ quản trị cơ sở dữ liệu không sử dụng mô hình bảng (table/row/column) truyền thống của RDBMS.
- **MongoDB** là hệ quản trị CSDL NoSQL hướng tài liệu (**Document-Oriented Database**) phổ biến nhất hiện nay.
- Dữ liệu được lưu trữ dưới dạng **BSON** (Binary JSON), hỗ trợ kiểu dữ liệu phong phú (ObjectId, Date, Binary data, Decimal128...).

#### So sánh thuật ngữ giữa SQL và MongoDB:

| RDBMS (SQL / PostgreSQL) | MongoDB (NoSQL) | Ý nghĩa |
|--------------------------|-----------------|---------|
| Database | Database | Cơ sở dữ liệu |
| Table | **Collection** | Tập hợp các bản ghi có liên quan |
| Row / Record | **Document** | Một bản ghi đơn lẻ dưới dạng BSON/JSON |
| Column | **Field** | Trường thông tin trong Document |
| Primary Key (`id`) | **Primary Key (`_id`)** | Mã định danh duy nhất (thường là `ObjectId`) |
| Foreign Key | **Reference (`ObjectId`)** | Thẻ liên kết tới document ở collection khác |
| JOIN | **`$lookup` / `.populate()`** | Phép nối dữ liệu giữa các collections |

#### Đặc tính nổi bật của MongoDB:
- **Dynamic Schema (Schema-less / Flexible Schema)**: Các document trong cùng một collection không bắt buộc phải có cấu trúc giống hệt nhau.
- **Horizontal Scalability (Sharding)**: Dễ dàng mở rộng theo chiều ngang bằng cách phân tán dữ liệu ra nhiều máy chủ (shards).
- **High Performance**: Đọc/ghi dữ liệu rất nhanh nhờ lưu trữ tài liệu dưới dạng phân cấp gộp (Embedded Data).

---

### 2. Schema Design: Embedded Documents vs Document References

Khác với SQL (luôn ưu tiên Normalization - phân rã bảng), thiết kế CSDL trong NoSQL phụ thuộc rất nhiều vào **cách ứng dụng truy vấn và truy cập dữ liệu (Query Patterns)**.

```
Mô hình lưu trữ NoSQL

┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│        EMBEDDED (Denormalized)        │   │        REFERENCED (Normalized)        │
├───────────────────────────────────────┤   ├───────────────────────────────────────┤
│ {                                     │   │ // Collection: Users                  │
│   _id: ObjectId("u1"),                │   │ { _id: ObjectId("u1"), name: "Huan" } │
│   name: "Huan",                       │   │                                       │
│   addresses: [                        │   │ // Collection: Addresses              │
│     { city: "Hanoi", street: "PBT" }, │   │ { _id: ObjectId("a1"),                │
│     { city: "HCM", street: "NVL" }    │   │   user_id: ObjectId("u1"),            │
│   ]                                   │   │   city: "Hanoi", street: "PBT" }      │
│ }                                     │   │                                       │
└───────────────────────────────────────┘   └───────────────────────────────────────┘
```

#### A. Embedding (Denormalization - Nhúng tài liệu)
Nhúng các tài liệu con (sub-documents) trực tiếp vào tài liệu cha.

- **Khi nào nên dùng?**
  - Mối quan hệ **1 - 1** hoặc **1 - Few** (ví dụ: User - Addresses, Order - OrderItems).
  - Dữ liệu con được truy vấn **cùng lúc** với dữ liệu cha.
  - Dữ liệu con ít bị thay đổi độc lập hoặc dữ liệu nhỏ (giới hạn 1 document MongoDB là 16MB).
- **Ưu điểm**: 1 lần query lấy được toàn bộ dữ liệu (High Read Performance), không cần JOIN.
- **Nhược điểm**: Document kích thước lớn, trùng lặp dữ liệu (nếu nhúng nhiều nơi), khó update dữ liệu trùng.

#### B. Referencing (Normalization - Tham chiếu tài liệu)
Chỉ lưu `ObjectId` của document ở collection khác và dùng phép kết hợp khi cần (`$lookup` hoặc `.populate()`).

- **Khi nào nên dùng?**
  - Mối quan hệ **1 - Many** lớn hoặc **Many - Many** (ví dụ: Authors - Books, Category - Products).
  - Dữ liệu tham chiếu thay đổi thường xuyên hoặc được truy vấn riêng lẻ độc lập.
  - Cần tránh vượt quá giới hạn 16MB/document.
- **Ưu điểm**: Dữ liệu gọn gàng, không bị trùng lặp, dễ dàng cập nhật một nơi.
- **Nhược điểm**: Cần nhiều hơn 1 lần query hoặc phải thực hiện `$lookup` / `populate()` gây giảm hiệu năng đọc.

---

### 3. Mongoose ODM & Thao tác CRUD

**Mongoose** là thư viện Object Data Modeling (ODM) phổ biến nhất cho Node.js và MongoDB, giúp định nghĩa Schema có kiểu dữ liệu rõ ràng (Strict Schema) và cung cấp các middleware/methods tiện ích.

#### Định nghĩa Schema & Model:

```javascript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  age: { type: Number, min: 0, max: 120 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Embedded array
  addresses: [{
    street: String,
    city: String,
    zipCode: String
  }],
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true // Tự động tạo createdAt và updatedAt
});

export const User = mongoose.model('User', userSchema);
```

#### Mongoose CRUD Cheat-Sheet:

```javascript
// ===== 1. CREATE (Tạo mới) =====
const newUser = await User.create({
  name: 'Sinh Huan',
  email: 'huan@example.com',
  age: 24,
  role: 'admin'
});

// ===== 2. READ (Truy vấn) =====
// Lấy danh sách kèm điều kiện & phân trang
const users = await User.find({ role: 'user', isActive: true })
  .select('name email age')       // Chỉ lấy các trường chỉ định
  .sort({ createdAt: -1 })        // Sắp xếp mới nhất trước
  .skip(0)                        // Skip (Offset)
  .limit(10);                     // Limit

// Tìm 1 document theo ID
const user = await User.findById('65f123456789abcdef123456');

// Referencing Populate (Phép JOIN)
const order = await Order.findById(orderId).populate('user_id', 'name email');

// ===== 3. UPDATE (Cập nhật) =====
// Update bằng Atomic Operators ($set, $inc, $push, $pull)
const updatedUser = await User.findByIdAndUpdate(
  userId,
  { 
    $set: { name: 'Huan Updated' },
    $inc: { age: 1 },             // Tăng tuổi thêm 1
    $push: { tags: 'fullstack' }   // Thêm phần tử vào array
  },
  { new: true, runValidators: true } // new: true để trả về doc sau update
);

// ===== 4. DELETE (Xóa) =====
await User.findByIdAndDelete(userId);
await User.deleteMany({ isActive: false });
```

---

## 💻 Thực hành: MongoDB & Mongoose Simulation Demo

Mã nguồn thực hành trong thư mục [`demos/day-25-nosql-databases/`](./demos/day-25-nosql-databases/):
- Thao tác giả lập In-Memory Mongo Database / Mongoose Schema validation.
- Thiết kế Data Model nhúng (**Embedded Order Items**) và tham chiếu (**Referenced User & Category**).
- Minh họa Aggregation Pipeline tính tổng doanh thu theo Category.

---

## ❓ Core Q&A / Câu hỏi ôn tập

### ❓ Câu 1: So sánh SQL (Relational DB) vs NoSQL (Document DB) chi tiết?

**Trả lời:**

| Tiêu chí | SQL (Relational Databases) | NoSQL (Document Databases - MongoDB) |
|----------|---------------------------|-------------------------------------|
| **Cấu trúc dữ liệu** | Bảng cố định (Tables, Rows, Columns) | Linh hoạt (Collections, JSON/BSON Documents) |
| **Schema** | Rigid Schema (Bắt buộc khai báo trước) | Dynamic / Schema-less (Linh hoạt thay đổi) |
| **Quan hệ & JOIN** | Tối ưu hóa cho `JOIN`, FK, Normalization | Ưu tiên `Embedding`, hạn chế JOIN/Lookup |
| **Mở rộng (Scaling)** | Vertical Scaling (Tăng RAM, CPU máy chủ) | Horizontal Scaling (Thêm máy chủ - Sharding) |
| **Tính toàn vẹn** | Tuân theo **ACID** nghiêm ngặt | Tuân theo **BASE** (Eventual Consistency), hỗ trợ ACID theo Document/Transaction |
| **Case sử dụng phù hợp** | Tài chính, Ngân hàng, E-commerce ERP, Hệ thống cần RDBMS & ACID chuẩn | CMS, IoT Data, Big Data Analytics, Real-time Feeds, Web Apps phát triển nhanh |

---

### ❓ Câu 2: Khi nào nên Embed Document và khi nào nên Reference (`ObjectId`)?

**Trả lời:**

1. **Nên dùng EMBEDDING khi:**
   - Quan hệ **1 - Few** (vài item con). Ví dụ: 1 User có 2-3 Địa chỉ giao hàng.
   - Dữ liệu con **không bao giờ xuất hiện độc lập** ngoài dữ liệu cha (Ví dụ: OrderItems trong Order).
   - Cần đọc nhanh dữ liệu trong **1 lần query duy nhất**.

2. **Nên dùng REFERENCING khi:**
   - Quan hệ **1 - Many lớn** (hàng nghìn sub-items, ví dụ: Log entries của System, Comments của bài báo lớn).
   - Quan hệ **Many - Many** (ví dụ: Students & Courses, Products & Tags).
   - Dữ liệu tham chiếu thay đổi thường xuyên ở nhiều nơi và cần tránh trùng lặp.

---

### ❓ Câu 3: MongoDB Aggregation Pipeline là gì? So sánh với SQL `GROUP BY`?

**Trả lời:**

**Aggregation Pipeline** là khung xử lý dữ liệu nâng cao của MongoDB theo mô hình đường ống (Data Pipeline). Dữ liệu đi qua các giai đoạn (stages) biến đổi tuần tự:

```
[ Raw Documents ] ──> $match ──> $group ──> $sort ──> $project ──> [ Result ]
```

- `$match`: Tương đương mệnh đề `WHERE` / `HAVING` trong SQL.
- `$group`: Tương đương mệnh đề `GROUP BY` trong SQL (`$sum`, `$avg`, `$min`, `$max`).
- `$sort`: Tương đương mệnh đề `ORDER BY`.
- `$project`: Chọn các field xuất ra (tương đương `SELECT col1, col2`).
- `$lookup`: Tương đương `LEFT OUTER JOIN`.

---

### ❓ Câu 4: CAP Theorem là gì và MongoDB đứng ở vị trí nào?

**Trả lời:**

**CAP Theorem** khẳng định một hệ thống phân tán chỉ có thể đảm bảo tối đa **2 trong 3** yếu tố:
1. **Consistency (C)**: Mọi node đều thấy cùng một dữ liệu tại một thời điểm.
2. **Availability (A)**: Mọi request đều nhận được response thành công (không lỗi/timeout).
3. **Partition Tolerance (P)**: Hệ thống vẫn hoạt động dù bị mất kết nối giữa các node.

👉 **MongoDB mặc định là hệ thống CP (Consistency & Partition Tolerance)**. Trong trường hợp xảy ra sự cố mạng phân tán (Network Partition), MongoDB ưu tiên duy trì tính nhất quán dữ liệu (Consistency) hơn là tính sẵn sàng (Availability) cho thao tác ghi ở Node bị mất Primary.

---

### ❓ Câu 5: Mongoose Middleware (Hooks) là gì?

**Trả lời:**

Mongoose Middleware (Hooks) là các hàm được thực thi tự động ở các thời điểm trong vòng đời của Schema: `pre` (trước khi thực thi) hoặc `post` (sau khi thực thi).

**Các loại Hooks phổ biến:**
- `document`: `save`, `validate`, `remove`
- `query`: `find`, `findOne`, `findOneAndUpdate`

**Ví dụ mã mã hóa mật khẩu trước khi lưu User:**

```javascript
userSchema.pre('save', async function (next) {
  // Chỉ hash password nếu field password bị thay đổi
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
```

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| MongoDB Official Manual | https://www.mongodb.com/docs/manual/ |
| Mongoose ODM Documentation | https://mongoosejs.com/docs/guide.html |
| Data Modeling Concepts (MongoDB) | https://www.mongodb.com/docs/manual/core/data-modeling-introduction/ |
| MongoDB University Free Courses | https://learn.mongodb.com/ |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**26/09 - Sat**) là buổi **Hands-on: REST API với Express.js + Database** — Xây dựng hoàn chỉnh một ứng dụng Backend RESTful API với Express.js, kết nối CSDL, tổ chức kiến trúc lớp Controller/Service/Model, validation middleware và xử lý lỗi tập trung.
