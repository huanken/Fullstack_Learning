# 📋 Learning Review — Ngày 30/09/2026 (Thứ Tư)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 30/09/2026 (Wed) |
| **Chủ đề** | **System Architecture (Monolith vs Microservices) & Advanced NoSQL (MongoDB Aggregation)** |
| **Session Type** | Self-Study (Architectural Patterns & NoSQL Aggregation) |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **So sánh chuyên sâu mô hình dữ liệu Document Model vs Relational Model, Thiết kế Schema NoSQL (Embedding vs Referencing), Xây dựng các đường ống truy vấn nâng cao MongoDB Aggregation Pipeline ($match, $group, $project, $lookup, $unwind), Phân tích đánh đổi giữa kiến trúc Monolith vs Microservices, Định giới hạn dịch vụ với Domain-Driven Design (DDD), Giao tiếp Đồng bộ vs Bất đồng bộ (Message Queues) và Khái niệm API Gateway.**

---

## 🔍 Key Concepts cần nắm vững

### 1. Document Model vs Relational Model

So sánh hai triết lý thiết kế cơ sở dữ liệu phổ biến nhất hiện nay:

```
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│       RELATIONAL MODEL (RDBMS)        │   │        DOCUMENT MODEL (NoSQL)         │
├───────────────────────────────────────┤   ├───────────────────────────────────────┤
│ • Dữ liệu chuẩn hóa (Normalization)  │   │ • Dữ liệu tự chứa (Self-contained)    │
│ • Bảng cố định (Strict Table Schema)  │   │ • Schema linh hoạt (Dynamic Schema)   │
│ • Quan hệ FK & JOIN giữa các bảng     │   │ • Nhúng dữ liệu (Embedding) / Ref     │
│ • Đảm bảo nghiêm ngặt tính ACID       │   │ • Đảm bảo mô hình BASE / Eventual     │
│ • Mở rộng theo chiều dọc (Vertical)   │   │ • Mở rộng theo chiều ngang (Sharding) │
└───────────────────────────────────────┘   └───────────────────────────────────────┘
```

| Tiêu chí | Relational Model (PostgreSQL, MySQL) | Document Model (MongoDB) |
|----------|--------------------------------------|--------------------------|
| **Đơn vị dữ liệu** | Bảng (Table) & Hàng (Row) | Tập hợp (Collection) & Tài liệu (Document BSON) |
| **Cấu trúc dữ liệu** | Cố định (Strict Schema), cần Migration khi sửa | Linh hoạt (Flexible), hỗ trợ các kiểu dữ liệu lồng nhau |
| **Phép nối (Joins)** | Rất mạnh mẽ (`JOIN` hỗ trợ native ở engine) | Cần cân nhắc (`$lookup` tốn chi phí hơn, ưu tiên embed) |
| **Giao dịch (Transactions)** | ACID tuyệt đối (Atomicity, Consistency, Isolation, Durability) | ACID ở cấp đơn document (từ MongoDB 4.0 hỗ trợ Multi-document ACID) |
| **Khả năng mở rộng** | Scaling Up (Tăng RAM/CPU máy chủ) | Scaling Out (Phân tán shards qua nhiều server dễ dàng) |

---

## 🍃 2. Schema Design NoSQL: Embedding vs Referencing

Trong NoSQL, **Query Patterns (cách ứng dụng đọc dữ liệu)** quyết định cách thiết kế CSDL chứ không phải lý thuyết chuẩn hóa.

```
                  THIẾT KẾ SCHEMA NOSQL (MONGODB)
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. EMBEDDING (Nhúng Sub-documents)                                          │
│    {                                                                        │
│      _id: "order_1",                                                        │
│      items: [ { prod: "M3", price: 2000 }, { prod: "Chair", price: 300 } ]  │
│    }                                                                        │
│    -> Ưu điểm: 1 query đọc toàn bộ order kèm items (High Read Performance). │
│    -> Dùng cho: Mối quan hệ 1-1, 1-N nhỏ (1-Few), dữ liệu truy vấn cùng nhau│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. REFERENCING (Tham chiếu ObjectId)                                       │
│    { _id: "order_1", userId: "u101" } // User nằm ở collection 'users'      │
│    -> Ưu điểm: Tránh trùng lặp dữ liệu, document không bị vượt giới hạn 16MB.│
│    -> Dùng cho: Mối quan hệ 1-N lớn (1-Squillions), N-N, dữ liệu thay đổi độc│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 3. MongoDB Aggregation Pipeline Stages

Aggregation Pipeline trong MongoDB hoạt động giống như một **dây chuyền nhà máy (Assembly Line)**, dữ liệu đi qua từng công đoạn (stage) và kết quả của stage trước là đầu vào của stage sau.

```
┌─────────────┐    ┌────────────┐    ┌─────────────┐    ┌─────────────┐    ┌────────────┐
│   $match    │ ─> │  $unwind   │ ─> │   $group    │ ─> │   $lookup   │ ─> │  $project  │
│(Lọc dữ liệu)│    │(Mở rộng arr│    │(Nhóm & gom) │    │(JOIN bảng)  │    │(Chọn trường│
└─────────────┘    └────────────┘    └─────────────┘    └─────────────┘    └────────────┘
```

### Các Stage quan trọng nhất:
1. **`$match`**: Lọc các document thỏa mãn điều kiện (tương tự `WHERE` trong SQL).
2. **`$unwind`**: Tách một mảng trong document thành nhiều document đơn lẻ (ví dụ: tách mảng 3 `items` thành 3 document độc lập).
3. **`$group`**: Nhóm các document theo một key và thực hiện các hàm gom tụ như `$sum`, `$avg`, `$min`, `$max` (tương tự `GROUP BY`).
4. **`$lookup`**: Phép JOIN dữ liệu từ một collection khác (`from`, `localField`, `foreignField`, `as`).
5. **`$project`**: Chọn lọc các field cần trả về, tính toán field mới hoặc đổi tên field (tương tự `SELECT`).
6. **`$sort` & `$limit`**: Sắp xếp thứ tự (`1` tăng dần, `-1` giảm dần) và giới hạn số lượng kết quả.

---

## 🏗️ 4. Kiến trúc Hệ thống: Monolith vs Microservices

```
┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
│          MONOLITHIC ARCHITECTURE      │   │       MICROSERVICES ARCHITECTURE      │
├───────────────────────────────────────┤   ├───────────────────────────────────────┤
│ ┌───────────────────────────────────┐ │   │ ┌──────────────┐     ┌──────────────┐ │
│ │ UI Layer                          │ │   │ │ Auth Service │     │ Order Service│ │
│ ├───────────────────────────────────┤ │   │ └──────┬───────┘     └──────┬───────┘ │
│ │ Business Logic (User, Order, Pay) │ │   │        │                    │         │
│ ├───────────────────────────────────┤ │   │ ┌──────▼───────┐     ┌──────▼───────┐ │
│ │ Data Access Layer                 │ │   │ │ Auth DB      │     │ Order DB     │ │
│ └─────────────────┬─────────────────┘ │   │ └──────────────┘     └──────────────┘ │
│                   ▼                   │   │                                       │
│          ┌─────────────────┐          │   │      ┌─────────────────────────┐      │
│          │ Single Database │          │   │      │ API Gateway / Msg Queue │      │
│          └─────────────────┘          │   │      └─────────────────────────┘      │
└───────────────────────────────────────┘   └───────────────────────────────────────┘
```

### Phân tích Đánh đổi (Trade-offs):

| Tiêu chí | Monolith (Đơn khối) | Microservices (Vi dịch vụ) |
|----------|---------------------|----------------------------|
| **Độ phức tạp** | 🟢 Thấp (Dễ triển khai, dễ debug tại local) | 🔴 Rất cao (Cần hạ tầng Orchestration, Service Discovery) |
| **Tốc độ phát triển ban đầu** | 🟢 Nhanh (Phù hợp cho Startup / MVP) | 🟡 Chậm hơn (Phải dựng bộ hạ tầng ban đầu) |
| **Khả năng mở rộng (Scale)** | 🟡 Scale toàn bộ app (Tốn tài nguyên) | 🟢 Scale độc lập dịch vụ bị nghẽn (Tối ưu chi phí) |
| **Cô lập sự cố (Fault Isolation)** | 🔴 Lỗi 1 module có thể làm sập toàn bộ app | 🟢 1 dịch vụ sập các dịch vụ khác vẫn hoạt động |
| **Ranh giới dữ liệu** | 1 CSDL chung (Dễ query JOIN) | Database-per-Service (Không JOIN được, cần Saga Pattern) |

> 💡 **Quy tắc vàng**: Bắt đầu bằng một **Monolith được thiết kế mô-đun hóa tốt (Modular Monolith)**. Chỉ tách ra Microservices khi quy mô đội ngũ phát triển và tải hệ thống tăng lên vượt ngưỡng xử lý.

---

## 🌐 5. Domain-Driven Design (DDD) & Service Boundaries

Định ranh giới cho dịch vụ (Service Boundaries) là thách thức lớn nhất khi chuyển sang Microservices. **DDD (Domain-Driven Design)** cung cấp bộ công cụ tư duy để giải bài toán này:

1. **Bounded Context (Ngữ cảnh hữu hạn)**: Ranh giới mã nguồn và mô hình dữ liệu nơi một thuật ngữ có ý nghĩa chính xác. Ví dụ: Khái niệm `Product` trong Bounded Context **Kho hàng** có giá trị là `khối lượng, kích thước, số lượng tồn`, nhưng trong Bounded Context **Bán hàng** lại có giá trị là `giá niêm yết, khuyến mãi, hình ảnh`.
2. **Aggregates & Entities**: Tập hợp các đối tượng dữ liệu gắn liền với nhau và chịu sự quản lý của một **Aggregate Root** để đảm bảo tính toàn vẹn kinh doanh.
3. **Ubiquitous Language (Ngôn ngữ chung)**: Bộ từ vựng kỹ thuật và nghiệp vụ được cả Developer và Business Stakeholder thống nhất sử dụng chung.

---

## 🔄 6. Communication: Synchronous vs Asynchronous

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. SYNCHRONOUS (Đồng bộ - REST / gRPC)                                      │
│    Client ── Request ──> Service A ── Request ──> Service B                │
│    Client <── Response ── Service A <── Response ── Service B                │
│    -> Đặc điểm: Chờ phản hồi ngay. Tight coupling (Phụ thuộc thời gian sống)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. ASYNCHRONOUS (Bất đồng bộ - Message Queue: RabbitMQ, Kafka)              │
│    Service A ── Publish Event ("OrderCreated") ──> [ Message Broker ]       │
│                                                          │                  │
│    Service B (Email) <── Consume Event ──────────────────┤                  │
│    Service C (Inventory) <── Consume Event ──────────────┘                  │
│    -> Đặc điểm: Non-blocking, Loose Coupling, Event-Driven Architecture.     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🚪 7. API Gateway Concept

**API Gateway** đóng vai trò là Cổng vào duy nhất (Single Point of Entry) cho tất cả các Client truy cập vào hệ thống Microservices Backend.

### Các chức năng cốt lõi của API Gateway:
- **Routing & Reverse Proxy**: Điều hướng request `/api/v1/users` về User Service, `/api/v1/orders` về Order Service.
- **Authentication & Authorization Offloading**: Xác thực JWT Token tại Gateway trước khi đẩy request vào các service bên trong.
- **Rate Limiting & Throttling**: Chống tấn công DDoS hoặc quá tải hệ thống bằng cách giới hạn 100 req/phút mỗi IP.
- **Load Balancing**: Cân bằng tải giữa nhiều instance của cùng một microservice.
- **Circuit Breaking**: Tự động ngắt kết nối tới các service đang gặp sự cố để tránh sụp đổ dây chuyền (Cascading Failure).

---

## 🛠️ Thực hành / Hands-on Implementation

Dự án mẫu thực hành mô phỏng NoSQL Aggregation Pipeline tại: [`demos/day-30-nosql-aggregation/`](file:///c:/Users/Sinh%20Huan/Desktop/Fullstack_learning/demos/day-30-nosql-aggregation/)

### Đường ống Aggregation Pipeline thực tế trong mã nguồn (`aggregation-demo.js`):

```javascript
// Pipeline thống kê tổng chi tiêu khách hàng kèm JOIN tên và email
export function getCustomerTotalSpendPipeline() {
  return [
    // Stage 1: Chỉ lấy các đơn hàng đã hoàn thành
    { $match: { status: 'completed' } },
    
    // Stage 2: Gom nhóm theo userId và tính tổng số tiền
    { 
      $group: { 
        _id: '$userId', 
        totalSpent: { $sum: '$totalAmount' }, 
        orderCount: { $sum: 1 } 
      } 
    },
    
    // Stage 3: JOIN với collection 'users' để lấy thông tin khách hàng
    { 
      $lookup: { 
        from: 'users', 
        localField: '_id', 
        foreignField: '_id', 
        as: 'userInfo' 
      } 
    },
    
    // Stage 4: Giải nén mảng userInfo chứa 1 phần tử
    { $unwind: '$userInfo' },
    
    // Stage 5: Định dạng dữ liệu đầu ra đẹp mắt
    { 
      $project: { 
        userId: '$_id', 
        userName: '$userInfo.name', 
        email: '$userInfo.email', 
        totalSpent: 1, 
        orderCount: 1 
      } 
    },
    
    // Stage 6: Sắp xếp người chi tiêu nhiều nhất lên đầu
    { $sort: { totalSpent: -1 } }
  ];
}
```

---

## 🧪 Kiểm thử & Kết quả

Đã chạy bộ kiểm thử tự động `test-aggregation.js` thành công 5/5 test cases:

```bash
cd demos/day-30-nosql-aggregation
npm test
```

### Kết quả chạy kiểm thử thực tế:
- ✅ **Test 1**: Stage `$match` lọc chính xác 3 đơn hàng `completed` (bỏ qua đơn `cancelled`).
- ✅ **Test 2**: Stage `$unwind` giải nén mảng items thành 5 sub-items độc lập.
- ✅ **Test 3**: Stage `$group` tính chính xác tổng chi tiêu của user `u101` là **3,600$** ($2600 + $1000).
- ✅ **Test 4**: Stage `$lookup` thực hiện JOIN thành công với `users` collection, ghép đúng `userName` và `email`.
- ✅ **Test 5**: Stage `$sort` sắp xếp top spender `Nguyen Van A` ($3,600) lên vị trí đầu tiên.

---

## 📌 Tổng kết & Core Takeaways

1. **NoSQL Schema Design**: Lựa chọn **Embedding** cho dữ liệu đi kèm thường xuyên đọc cùng nhau và **Referencing** cho dữ liệu biến động độc lập hoặc quan hệ 1-N lớn.
2. **MongoDB Aggregation**: Thành thạo 6 stage cơ bản (`$match`, `$unwind`, `$group`, `$lookup`, `$project`, `$sort`) để xử lý báo cáo phức tạp ngay tại database layer mà không cần kéo toàn bộ data về ứng dụng.
3. **Microservices Evolution**: Luôn bắt đầu từ một Modular Monolith chuẩn chỉnh. Sử dụng DDD Bounded Context để chia dịch vụ và dùng Message Broker (RabbitMQ/Kafka) cho giao tiếp bất đồng bộ giữa các vi dịch vụ.
