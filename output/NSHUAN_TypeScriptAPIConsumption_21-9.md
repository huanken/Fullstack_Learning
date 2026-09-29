# 📋 Learning Review — Ngày 21/09/2026 (Thứ Hai)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 21/09/2026 (Mon) |
| **Chủ đề** | **TypeScript for Web & API Consumption** |
| **Session Type** | Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **TypeScript basic types & interfaces; typing API responses; fetch/axios usage with async/await; error handling for network calls**

---

## 🔍 Key Concepts cần nắm vững

### 1. TypeScript Basic Types & Interfaces

- TypeScript là **superset của JavaScript** — thêm static typing, compile ra JS thuần
- Giúp phát hiện lỗi **tại thời điểm viết code** thay vì runtime
- So sánh: Dart (Flutter) cũng là strongly typed — TypeScript cho trải nghiệm tương tự trên web

**Các kiểu dữ liệu cơ bản:**

```typescript
// Primitive types
let name: string = 'Huan';
let age: number = 25;
let isActive: boolean = true;
let nothing: null = null;
let notDefined: undefined = undefined;

// Array
let scores: number[] = [90, 85, 72];
let names: Array<string> = ['Alice', 'Bob'];

// Tuple — array có cố định số phần tử và kiểu
let pair: [string, number] = ['age', 25];

// Enum
enum Status {
  Pending = 'PENDING',
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}
let currentStatus: Status = Status.Active;

// Union type — có thể là kiểu này HOẶC kiểu kia
let id: string | number = 'abc-123';
id = 456; // ✅ cũng hợp lệ

// Literal type — chỉ nhận giá trị cụ thể
let direction: 'up' | 'down' | 'left' | 'right' = 'up';

// any vs unknown
let risky: any = 'hello';     // ❌ bỏ qua type checking hoàn toàn
let safe: unknown = 'hello';  // ✅ phải kiểm tra type trước khi dùng
if (typeof safe === 'string') {
  console.log(safe.toUpperCase()); // OK sau khi narrowing
}
```

**Interface vs Type Alias:**

```typescript
// Interface — mô tả hình dạng (shape) của object
interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;       // optional property (có thể không có)
  readonly createdAt: Date; // không thể thay đổi sau khi tạo
}

// Extending interface
interface Admin extends User {
  role: 'admin' | 'superadmin';
  permissions: string[];
}

// Type alias — linh hoạt hơn
type ID = string | number;

type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

// So sánh nhanh
// Interface: dùng cho object shape, có thể extend/merge
// Type: dùng cho union, intersection, mapped types, linh hoạt hơn
```

**Generics — tái sử dụng logic với nhiều kiểu khác nhau:**

```typescript
// Generic function
function getFirst<T>(items: T[]): T | undefined {
  return items[0];
}

const firstNumber = getFirst<number>([1, 2, 3]);   // number | undefined
const firstName = getFirst<string>(['a', 'b']);     // string | undefined

// Generic interface
interface ApiResponse<T> {
  data: T;
  error: string | null;
  timestamp: number;
}

// Sử dụng
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: 'Huan', email: 'huan@email.com', createdAt: new Date() },
  error: null,
  timestamp: Date.now(),
};
```

### 2. Typing API Responses

- Định nghĩa **interface/type** cho mọi API response — tránh dùng `any`
- Giúp IDE autocomplete, phát hiện lỗi sớm, dễ refactor

```typescript
// Định nghĩa response types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// API response có thể thành công hoặc thất bại
type ApiResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ErrorResponse };
```

**Typing cho React component với API data:**

```tsx
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

interface ProductListProps {
  category?: string;
  onProductSelect: (product: Product) => void;
}

function ProductList({ category, onProductSelect }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ... fetch và render
}
```

### 3. fetch/axios Usage with async/await

**Sử dụng fetch (built-in):**

```typescript
// Basic fetch với TypeScript
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: User = await response.json();
  return data;
}

// fetch với options đầy đủ
async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    throw new Error(error.error.message);
  }

  return response.json() as Promise<User>;
}

// fetch danh sách có pagination
async function fetchProducts(
  page: number = 1,
  pageSize: number = 20,
  category?: string
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  });

  if (category) params.append('category', category);

  const response = await fetch(`/api/products?${params}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  return response.json();
}
```

**Sử dụng axios (library phổ biến):**

```typescript
import axios, { AxiosResponse, AxiosError } from 'axios';

// Tạo axios instance với config chung
const api = axios.create({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor — thêm token tự động
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// GET request
async function getUser(id: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
  // axios tự parse JSON và trả về data đã typed
}

// POST request
async function createUser(userData: Omit<User, 'id'>): Promise<User> {
  const { data } = await api.post<User>('/users', userData);
  return data;
}

// PUT request
async function updateUser(id: number, updates: Partial<User>): Promise<User> {
  const { data } = await api.put<User>(`/users/${id}`, updates);
  return data;
}

// DELETE request
async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
```

**So sánh fetch vs axios:**

| Tiêu chí | fetch (built-in) | axios (library) |
|----------|-----------------|-----------------|
| **Cài đặt** | Không cần — có sẵn trong browser | Cần `npm install axios` |
| **JSON parse** | Phải gọi `.json()` thủ công | Tự động parse |
| **Error handling** | Không throw error cho 4xx/5xx — chỉ cho network error | Throw error cho mọi status không phải 2xx |
| **Interceptors** | Không có sẵn | ✅ Request/Response interceptors |
| **Cancel request** | `AbortController` | `CancelToken` hoặc `AbortController` |
| **Timeout** | Phải tự implement | ✅ Config `timeout` sẵn |
| **Progress** | Hạn chế | ✅ Upload/download progress |
| **Bundle size** | 0KB (native) | ~13KB (gzipped) |

### 4. Error Handling for Network Calls

**Các loại lỗi cần xử lý:**

```
1. Network Error     — Mất kết nối, DNS fail, server down
2. Timeout Error     — Request quá lâu
3. HTTP Error        — Server trả về 4xx/5xx
4. Parse Error       — Response không phải JSON hợp lệ
5. Business Error    — Logic error từ server (validation fail, not found...)
```

**Pattern xử lý lỗi toàn diện với fetch:**

```typescript
// Custom error class
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errorCode?: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Wrapper function xử lý lỗi
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(10000), // timeout 10s
    });

    // HTTP Error (4xx, 5xx)
    if (!response.ok) {
      let errorBody: ErrorResponse | null = null;
      try {
        errorBody = await response.json();
      } catch {
        // response body không phải JSON
      }

      throw new ApiError(
        errorBody?.error?.message || `HTTP ${response.status}`,
        response.status,
        errorBody?.error?.code,
        errorBody?.error?.details
      );
    }

    // Parse response
    const data = await response.json() as T;
    return data;

  } catch (error) {
    // Network error (offline, DNS fail)
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new ApiError('Network error — kiểm tra kết nối internet', 0, 'NETWORK_ERROR');
    }

    // Timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('Request timeout — server không phản hồi', 0, 'TIMEOUT');
    }

    // Re-throw ApiError
    if (error instanceof ApiError) throw error;

    // Unknown error
    throw new ApiError('Unexpected error', 0, 'UNKNOWN');
  }
}

// Sử dụng
async function loadUser(id: number) {
  try {
    const user = await apiRequest<User>(`/api/users/${id}`);
    console.log(user.name);
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401: redirectToLogin(); break;
        case 403: showForbiddenMessage(); break;
        case 404: showNotFound(); break;
        case 429: retryAfterDelay(); break;
        default: showGenericError(error.message);
      }
    }
  }
}
```

**Error handling trong React component:**

```tsx
function UserProfile({ userId }: { userId: number }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/users/${userId}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          }
          throw new Error(`Server error: ${response.status}`);
        }

        const data: User = await response.json();
        setUser(data);

      } catch (err) {
        // Không set error nếu request bị cancel (unmount)
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    // Cleanup: cancel request khi unmount hoặc userId thay đổi
    return () => controller.abort();
  }, [userId]);

  // Render states
  if (loading) return <div className="skeleton">Loading...</div>;
  if (error) return <div className="error">❌ {error} <button onClick={() => {}}>Retry</button></div>;
  if (!user) return null;

  return (
    <div className="profile">
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}
```

**Retry pattern — tự động thử lại khi fail:**

```typescript
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiRequest<T>(url, options);
    } catch (error) {
      lastError = error as Error;

      // Không retry cho client errors (4xx) — chỉ retry cho server/network errors
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        throw error;
      }

      // Exponential backoff: 1s, 2s, 4s...
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}
```

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: TypeScript khác gì JavaScript? Tại sao nên dùng TypeScript cho dự án web?

**Trả lời:**

| Tiêu chí | JavaScript | TypeScript |
|----------|-----------|-----------|
| **Typing** | Dynamic — kiểu xác định lúc runtime | Static — kiểu xác định lúc compile |
| **Lỗi phát hiện** | Chỉ phát hiện khi **chạy** (runtime error) | Phát hiện **khi viết code** (compile error) |
| **IDE support** | Hạn chế autocomplete | ✅ Autocomplete, refactor, go-to-definition mạnh mẽ |
| **Chạy trực tiếp** | ✅ Browser/Node chạy trực tiếp | Cần compile ra JS trước |
| **Learning curve** | Thấp hơn | Cao hơn nhưng đáng đầu tư |

**Tại sao nên dùng TypeScript?**

1. **Bắt lỗi sớm** — Phát hiện bug trước khi user gặp phải
2. **Refactor an toàn** — Thay đổi tên, cấu trúc → compiler báo tất cả nơi cần sửa
3. **Documentation sống** — Interface/Type là tài liệu luôn đồng bộ với code
4. **Team collaboration** — Mọi người hiểu rõ data shape mà function nhận/trả về
5. **Ecosystem** — React, Next.js, Express đều có TypeScript support tốt

**So sánh với Dart (Flutter):** Dart cũng strongly typed tương tự → kinh nghiệm typing từ Dart/Flutter chuyển sang TypeScript rất nhanh. Khác biệt chính: TypeScript có union types (`string | number`) mà Dart không có.

---

### ❓ Câu 2: Phân biệt `interface` và `type` trong TypeScript? Khi nào dùng cái nào?

**Trả lời:**

| Tính năng | `interface` | `type` |
|-----------|-----------|--------|
| Mô tả object shape | ✅ | ✅ |
| Extend/kế thừa | `extends` keyword | `&` (intersection) |
| Union types | ❌ | ✅ `string \| number` |
| Merge declarations | ✅ (auto merge cùng tên) | ❌ (lỗi nếu trùng tên) |
| Mapped/Conditional types | ❌ | ✅ |
| `implements` trong class | ✅ | ✅ |

**Quy tắc thực tế:**

```typescript
// ✅ Dùng interface cho object shapes — API responses, props, models
interface User {
  id: number;
  name: string;
}

interface Admin extends User {
  permissions: string[];
}

// ✅ Dùng type cho unions, computed types, utility types
type Status = 'active' | 'inactive' | 'pending';
type ID = string | number;
type ReadonlyUser = Readonly<User>;
type UserWithoutId = Omit<User, 'id'>;
```

**Best practice:** Dùng `interface` cho mọi thứ mô tả "hình dạng" object. Chuyển sang `type` khi cần union, intersection, hoặc mapped types.

---

### ❓ Câu 3: Viết một service layer hoàn chỉnh với TypeScript để gọi API?

**Trả lời:**

```typescript
// types.ts — Định nghĩa tất cả types
interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface CreateUserInput {
  name: string;
  email: string;
  role?: 'user' | 'admin';
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: 'user' | 'admin';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// api-client.ts — Base HTTP client
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// user-service.ts — Service cho User entity
const userService = {
  getAll(page: number = 1): Promise<PaginatedResponse<User>> {
    return request(`/users?page=${page}`);
  },

  getById(id: number): Promise<User> {
    return request(`/users/${id}`);
  },

  create(input: CreateUserInput): Promise<User> {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  update(id: number, input: UpdateUserInput): Promise<User> {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    });
  },

  delete(id: number): Promise<void> {
    return request(`/users/${id}`, { method: 'DELETE' });
  },
};

export default userService;
```

---

### ❓ Câu 4: So sánh fetch vs axios — khi nào chọn cái nào?

**Trả lời:**

| Tiêu chí | Chọn `fetch` | Chọn `axios` |
|----------|-------------|-------------|
| **Dự án nhỏ/đơn giản** | ✅ Không cần thêm dependency | Overkill |
| **Cần interceptors** | Phải tự viết wrapper | ✅ Có sẵn |
| **Cần upload progress** | Phải dùng XMLHttpRequest | ✅ `onUploadProgress` |
| **Error handling** | Phải check `response.ok` thủ công | ✅ Tự throw cho non-2xx |
| **Cancel requests** | `AbortController` (hơi verbose) | ✅ `CancelToken` (gọn hơn) |
| **Bundle size matters** | ✅ 0KB — native API | +13KB |
| **Node.js (SSR)** | Cần polyfill (Node < 18) | ✅ Hoạt động cả browser & Node |
| **Response transform** | Tự `.json()` | ✅ Tự động |

**Tóm tắt:**
- **Dự án mới, nhỏ, ít API calls** → `fetch` + wrapper function
- **Dự án lớn, nhiều API, cần interceptor/retry** → `axios` + instance config
- **Team đã quen axios** → Tiếp tục dùng axios

---

### ❓ Câu 5: Giải thích async/await và cách xử lý lỗi khi gọi API?

**Trả lời:**

**async/await** là syntax giúp viết code bất đồng bộ **trông giống đồng bộ** — dễ đọc hơn Promise chain.

```typescript
// Promise chain (khó đọc khi phức tạp)
function loadData() {
  return fetch('/api/data')
    .then(res => res.json())
    .then(data => processData(data))
    .then(result => saveResult(result))
    .catch(err => handleError(err));
}

// async/await (dễ đọc hơn)
async function loadData() {
  try {
    const res = await fetch('/api/data');
    const data = await res.json();
    const result = await processData(data);
    await saveResult(result);
  } catch (err) {
    handleError(err);
  }
}
```

**Pattern xử lý lỗi trong component React:**

```tsx
function useApi<T>(fetchFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  return { data, loading, error, execute };
}

// Sử dụng custom hook
function UserPage({ id }: { id: number }) {
  const { data: user, loading, error, execute } = useApi(
    () => userService.getById(id)
  );

  useEffect(() => { execute(); }, [execute]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={execute} />;
  if (!user) return null;

  return <UserCard user={user} />;
}
```

---

### ❓ Câu 6: Các Utility Types phổ biến trong TypeScript?

**Trả lời:**

| Utility Type | Chức năng | Ví dụ |
|---|---|---|
| `Partial<T>` | Mọi property → optional | `Partial<User>` → `{ id?: number; name?: string; ... }` |
| `Required<T>` | Mọi property → required | `Required<{ name?: string }>` → `{ name: string }` |
| `Readonly<T>` | Mọi property → readonly | Không thể reassign sau khi tạo |
| `Pick<T, K>` | Chọn một số properties | `Pick<User, 'id' \| 'name'>` → `{ id: number; name: string }` |
| `Omit<T, K>` | Loại bỏ một số properties | `Omit<User, 'id'>` → User không có id (dùng cho create) |
| `Record<K, V>` | Map từ key → value | `Record<string, number>` → `{ [key: string]: number }` |

**Ứng dụng thực tế:**

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

// Create: không cần id và createdAt (server tự tạo)
type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

// Update: mọi field đều optional
type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt'>>;

// Display: chỉ cần một số fields
type UserSummary = Pick<User, 'id' | 'name' | 'avatar'>;

// API params
type QueryParams = Record<string, string | number | boolean>;
```

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| TypeScript Official Handbook | https://www.typescriptlang.org/docs/handbook/ |
| TypeScript Playground | https://www.typescriptlang.org/play |
| React TypeScript Cheatsheet | https://react-typescript-cheatsheet.netlify.app/ |
| MDN - Using Fetch | https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch |
| Axios Documentation | https://axios-http.com/docs/intro |
| Total TypeScript - Beginners Tutorial | https://www.totaltypescript.com/tutorials/beginners-typescript |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**22/09 - Tue**) là buổi **Review Meeting + Node.js & Express Basics** — 30 phút review với mentor về các chủ đề Fri–Mon, sau đó học Node.js event loop, Express app setup, routing & middleware. Nắm vững TypeScript và API consumption hôm nay sẽ giúp bạn viết backend code typed và xử lý request/response hiệu quả.
