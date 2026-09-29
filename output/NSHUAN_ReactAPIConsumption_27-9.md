# 📋 Learning Review — Ngày 27/09/2026 (Chủ Nhật)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 27/09/2026 (Sun) |
| **Chủ đề** | **Hands-on: React Frontend Consuming API** |
| **Session Type** | Self-Study (Hands-on Lab) |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **Thực hành xây dựng ứng dụng Web React Frontend tiêu thụ RESTful API Backend: Thiết kế Custom Hooks tích hợp API (`useFetch`, `useApi`), quản lý trạng thái Async State (Loading, Error, Data), cấu hình Axios Client với Interceptors, triển khai Form CRUD, Phân trang, Tìm kiếm Debounce và Optimistic UI Updates.**

---

## 🔍 Key Concepts cần nắm vững

### 1. Kiến trúc Tích hợp API trong React Application

Một ứng dụng React chuẩn không viết hàm `fetch()` trực tiếp rải rác bên trong các JSX components. Thay vào đó, ứng dụng được chia thành các lớp trừu tượng hoá kết nối dữ liệu:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ React UI Component Layer (Views)                                             │
│                                                                              │
│   ┌──────────────────────┐    ┌──────────────────────┐    ┌───────────────┐  │
│   │   ProductListPage    │    │   ProductCardItem    │    │  ProductModal │  │
│   └──────────┬───────────┘    └──────────┬───────────┘    └───────┬───────┘  │
└──────────────┼───────────────────────────┼────────────────────────┼──────────┘
               │ Triggers Action           │ Renders Data           │ Submits Form
               ▼                           ▼                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Custom Hooks Layer (State & Effect Orchestration)                            │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │ useProducts(params) -> { products, isLoading, error, refetch, mutate }│   │
│   └───────────────────────────────────┬──────────────────────────────────┘   │
└───────────────────────────────────────┼──────────────────────────────────────┘
                                        │ Calls API Method
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ API Service Layer (HTTP Client Abstraction)                                  │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐   │
│   │ productApi.getProducts(), productApi.createProduct()                 │   │
│   └───────────────────────────────────┬──────────────────────────────────┘   │
└───────────────────────────────────────┼──────────────────────────────────────┘
                                        │ HTTP Request / Response (Axios / Fetch)
                                        ▼
                            ┌────────────────────────┐
                            │ Express.js REST API    │
                            └────────────────────────┘
```

---

### 2. Quản lý Trạng Thái Bất Đồng Bộ (Async State Pattern) & AbortController

Mọi thao tác gọi API trên Client đều có tính chất bất đồng bộ. Mỗi component gọi dữ liệu phải quản lý đúng 3 trạng thái cốt lõi:

```typescript
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}
```

#### Race Condition & AbortController Cleanups:
Khi người dùng chuyển trang nhanh hoặc nhập từ khóa tìm kiếm liên tục, các HTTP request cũ có thể phản hồi sau request mới (**Race Condition**). Cần sử dụng `AbortController` trong cleanup function của `useEffect`:

```javascript
import { useState, useEffect } from 'react';

export function useFetchProducts(searchQuery) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Khởi tạo AbortController để có thể hủy request khi unmount/re-render
    const controller = new AbortController();
    
    async function fetchData() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/v1/products?search=${searchQuery}`, {
          signal: controller.signal // Truyền signal vào fetch
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        // Không set error nếu request bị hủy chủ động
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch products');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();

    // 2. Cleanup Function: Hủy request trước đó nếu query thay đổi hoặc component unmount
    return () => {
      controller.abort();
    };
  }, [searchQuery]);

  return { data, isLoading, error };
}
```

---

### 3. Cấu Hóa HTTP Client với Axios Interceptors

Trừu tượng hóa Axios client giúp tập trung các logic chung như: tự động gắn `Authorization Header`, bắt lỗi 401 để logout, unwrap response envelope:

```javascript
// api/apiClient.js
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Gắn Bearer Token tự động
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Xử lý tập trung lỗi & unwrap envelope
apiClient.interceptors.response.use(
  (response) => response.data, // Trả trực tiếp response body ({ success, data, pagination })
  (error) => {
    const customError = {
      message: error.response?.data?.error?.message || 'Server error occurred',
      statusCode: error.response?.status || 500,
      details: error.response?.data?.error?.details || null
    };
    return Promise.reject(customError);
  }
);
```

---

### 4. Search Debounce & Optimistic UI Updates

#### A. Search Debounce (Giảm tải số lượng request)
Khi gõ vào ô tìm kiếm, không nên gửi API request ở từng phím gõ (keystroke). Ta trì hoãn gửi request cho đến khi người dùng ngưng gõ `300ms - 500ms`:

```javascript
function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

#### B. Optimistic UI Updates (Cập nhật giao diện tức thì)
Thay vì bắt người dùng đợi server phản hồi (100ms - 500ms) mới hiển thị item mới được tạo hoặc xóa, ta cập nhật React State ngay lập tức:

```javascript
const handleDeleteProduct = async (id) => {
  // 1. Sao lưu state hiện tại (phòng trường hợp rollback)
  const previousProducts = [...products];

  // 2. Cập nhật state UI NGAY LẬP TỨC (Optimistic)
  setProducts(prev => prev.filter(p => p.id !== id));

  try {
    // 3. Gửi API request ngầm ở background
    await productApi.deleteProduct(id);
    showToast('Product deleted successfully', 'success');
  } catch (err) {
    // 4. Nếu API thất bại -> Rollback lại state ban đầu & thông báo lỗi
    setProducts(previousProducts);
    showToast(`Failed to delete: ${err.message}`, 'error');
  }
};
```

---

## 💻 Thực hành: React Frontend Consuming API Dashboard

Mã nguồn thực hành hoàn chỉnh được đóng gói tại [`demos/day-27-react-api-consumption/`](./demos/day-27-react-api-consumption/):

### Tính năng ứng dụng Web Demo:
- **Dashboard Quản Lý Sản Phẩm**: Hiển thị bảng danh sách sản phẩm với thông tin chi tiết (Hình ảnh/Icon, Tên, Category, Giá, Tồn kho, Ngày tạo).
- **Search & Filter Realtime**: Ô tìm kiếm Debounce tự động kết hợp bộ lọc Category (`Electronics`, `Books`, `Furniture`).
- **Form Modal Thêm / Sửa**: Modal tương tác với đầy đủ client-side validation, báo lỗi màu đỏ cho từng field.
- **Async Feedback & UI Skeleton**: Trạng thái loading quay mượt mà (Spinner/Skeleton), thông báo Toast nổi khi thành công/thất bại.
- **Optimistic UI Deletion**: Xóa sản phẩm với trải nghiệm người dùng tức thì.

---

## ❓ Core Q&A / Câu hỏi ôn tập

### ❓ Câu 1: Tại sao AbortController lại quan trọng trong `useEffect` khi gọi API trong React?

**Trả lời:**

1. **Tránh Memory Leak**: Khi component bị unmount trước khi API trả về, nếu tiếp tục gọi `setState()` trên một unmounted component, React sẽ cảnh báo memory leak.
2. **Ngăn chặn Race Condition**: Nếu người dùng gõ nhanh từ khóa `A` -> `AB` -> `ABC`, có 3 requests được gửi. Nếu request `A` phản hồi chậm hơn request `ABC`, kết quả hiển thị trên màn hình sẽ bị sai (hiển thị của `A` thay vì `ABC`). Hủy request cũ đảm bảo chỉ kết quả mới nhất được cập nhật.

---

### ❓ Câu 2: So sánh `Axios` và `fetch` API nguyên bản?

**Trả lời:**

| Tiêu chí | Native `fetch` API | `Axios` Library |
|----------|--------------------|-----------------|
| **Cài đặt** | Có sẵn trong trình duyệt & Node.js 18+ | Cần cài thư viện `npm i axios` |
| **Xử lý JSON** | Phải gọi `.json()` thủ công | Tự động parse JSON response |
| **Error Handling** | Không tự động throw Error với HTTP status 4xx/5xx (chỉ throw khi lỗi mạng) | Tự động throw Error nếu status code ngoại trừ 2xx |
| **Interceptors** | Phải tự bọc hàm wrapper | Hỗ trợ Request/Response Interceptors mạnh mẽ |
| **Request Cancellation** | Dùng `AbortController` | Dùng `AbortController` hoặc `CancelToken` |

---

### ❓ Câu 3: Optimistic UI Update là gì? Khi nào NÊN và KHÔNG NÊN sử dụng?

**Trả lời:**

- **Khái niệm**: Là kỹ thuật giả định hành động API sẽ thành công và cập nhật UI ngay lập tức trước khi nhận phản hồi thực sự từ server.

- **NÊN sử dụng khi:**
  - Thao tác có tỷ lệ thành công rất cao (Like bài viết, Toggle Bookmark, Thêm item vào giỏ hàng, Xóa item).
  - Cần mang lại trải nghiệm người dùng (UX) cảm giác cực nhanh (instant response).

- **KHÔNG NÊN sử dụng khi:**
  - Thao tác nhạy cảm liên quan đến thanh toán tiền, đặt vé máy bay, giao dịch ngân hàng.
  - Thao tác cần Server trả về ID hoặc dữ liệu được tính toán phức tạp (ví dụ: tạo hóa đơn với mã số thuế và giảm giá).

---

### ❓ Câu 4: Làm thế nào để tự động Refresh Token (Xử lý 401 Unauthorized) bằng Axios Interceptor?

**Trả lời:**

Sử dụng Response Interceptor để chặn lỗi 401. Nếu gặp lỗi 401, gửi request lấy Refresh Token mới và thử lại request cũ (Retry Original Request):

```javascript
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/v1/auth/refresh', {
          refreshToken: localStorage.getItem('refresh_token')
        });
        localStorage.setItem('access_token', data.accessToken);
        processQueue(null, data.accessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| React Official Docs - Fetching Data | https://react.dev/learn/synchronizing-with-effects#fetching-data |
| Axios Interceptors Guide | https://axios-http.com/docs/interceptors |
| TanStack Query (React Query) Concepts | https://tanstack.com/query/latest/docs/framework/react/overview |
| Optimistic UI Patterns | https://uxdesign.cc/optimistic-ui-patterns-97f0a8a29009 |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**28/09 - Mon**) là buổi **API Security - Authentication** — Khám phá cơ chế xác thực an toàn trong ứng dụng Web: OAuth 2.0 flow types (Authorization Code, Client Credentials), cấu trúc JWT Tokens (Header, Payload, Signature), Token Expiry, Refresh Tokens và các phương pháp lưu trữ token an toàn (HttpOnly Cookies vs LocalStorage).
