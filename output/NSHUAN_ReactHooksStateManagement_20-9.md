# 📋 Learning Review — Ngày 20/09/2026 (Chủ Nhật)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 20/09/2026 (Sun) |
| **Chủ đề** | **React Hooks & Basic State Management** |
| **Session Type** | Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **useState and useEffect hooks; lifting state up; when to use local vs shared state; how this compares to MVVM/Provider patterns from mobile**

---

## 🔍 Key Concepts cần nắm vững

### 1. useState Hook

- `useState` là hook cơ bản nhất — cho phép functional component có **state**
- Trả về một array: `[currentValue, setterFunction]`
- Mỗi lần gọi setter → component **re-render** với giá trị mới
- State được **bảo toàn** giữa các lần render (React lưu trữ nội bộ)

```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);  // khởi tạo = 0

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}
```

**Các pattern quan trọng với `useState`:**

```jsx
// 1. State là object — cần spread để giữ fields khác
const [user, setUser] = useState({ name: '', email: '', age: 0 });
setUser({ ...user, name: 'Huan' });  // ✅ giữ email và age
setUser({ name: 'Huan' });           // ❌ mất email và age

// 2. State là array — immutable update
const [items, setItems] = useState([]);
setItems([...items, newItem]);           // thêm item
setItems(items.filter(i => i.id !== id)); // xóa item
setItems(items.map(i => i.id === id ? { ...i, done: true } : i)); // sửa item

// 3. Functional update — khi state mới phụ thuộc state cũ
setCount(prev => prev + 1);  // ✅ an toàn với batching
setCount(count + 1);         // ⚠️ có thể bị stale closure

// 4. Lazy initialization — khi tính toán khởi tạo nặng
const [data, setData] = useState(() => {
  return expensiveComputation();  // chỉ chạy lần đầu render
});
```

### 2. useEffect Hook

- `useEffect` cho phép thực hiện **side effects** trong component: fetch data, subscriptions, timers, DOM manipulation
- Chạy **sau khi render** (không block painting)
- **Dependency array** kiểm soát khi nào effect chạy lại

```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Side effect: fetch data
    setLoading(true);
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      });

    // Cleanup function (optional) — chạy trước khi effect chạy lại hoặc unmount
    return () => {
      console.log('Cleanup: cancel pending requests if needed');
    };
  }, [userId]);  // ← dependency array: chỉ chạy lại khi userId thay đổi

  if (loading) return <p>Loading...</p>;
  return <h1>{user.name}</h1>;
}
```

**3 trường hợp dependency array:**

| Dependency Array | Khi nào chạy | Use case |
|---|---|---|
| Không truyền: `useEffect(() => {...})` | **Mỗi lần render** | Hiếm khi dùng — dễ gây infinite loop |
| Array rỗng: `useEffect(() => {...}, [])` | **Chỉ 1 lần** sau mount | Fetch data ban đầu, setup subscriptions |
| Có dependencies: `useEffect(() => {...}, [a, b])` | Khi `a` hoặc `b` **thay đổi** | Fetch lại khi filter thay đổi, sync with props |

**Cleanup function — quan trọng để tránh memory leak:**

```jsx
useEffect(() => {
  // 1. Event listener
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(() => {
  // 2. Timer
  const timerId = setInterval(() => setSeconds(s => s + 1), 1000);
  return () => clearInterval(timerId);
}, []);

useEffect(() => {
  // 3. AbortController cho fetch
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then(res => res.json())
    .then(setData);
  return () => controller.abort();
}, [url]);
```

### 3. Lifting State Up

- Khi **2 component cùng cấp** cần chia sẻ dữ liệu → đưa state lên **component cha chung gần nhất**
- Component cha giữ state, truyền xuống các con qua **props**
- Con muốn thay đổi state → gọi **callback function** được truyền qua props

```
Trước khi lift state:
  ComponentA (có state riêng)    ComponentB (có state riêng)
  → Không thể chia sẻ data

Sau khi lift state:
  Parent (giữ shared state)
    ├── ComponentA (nhận qua props)
    └── ComponentB (nhận qua props)
  → Cả hai đọc cùng 1 nguồn data
```

**Ví dụ thực tế — Temperature Converter:**

```jsx
function TemperatureInput({ scale, temperature, onTemperatureChange }) {
  const scaleNames = { c: 'Celsius', f: 'Fahrenheit' };

  return (
    <fieldset>
      <legend>Enter temperature in {scaleNames[scale]}:</legend>
      <input
        value={temperature}
        onChange={(e) => onTemperatureChange(e.target.value)}
      />
    </fieldset>
  );
}

function Calculator() {
  // State được "lifted up" lên đây
  const [temperature, setTemperature] = useState('');
  const [scale, setScale] = useState('c');

  const handleCelsiusChange = (temp) => {
    setScale('c');
    setTemperature(temp);
  };

  const handleFahrenheitChange = (temp) => {
    setScale('f');
    setTemperature(temp);
  };

  const celsius = scale === 'f' ? ((temperature - 32) * 5 / 9).toFixed(2) : temperature;
  const fahrenheit = scale === 'c' ? ((temperature * 9 / 5) + 32).toFixed(2) : temperature;

  return (
    <div>
      <TemperatureInput scale="c" temperature={celsius} onTemperatureChange={handleCelsiusChange} />
      <TemperatureInput scale="f" temperature={fahrenheit} onTemperatureChange={handleFahrenheitChange} />
    </div>
  );
}
```

### 4. Local State vs Shared State

- **Local state**: State chỉ 1 component cần → dùng `useState` trong component đó
- **Shared state**: Nhiều component cần → lift state up hoặc dùng state management

**Quy tắc quyết định:**

```
Chỉ 1 component cần data này?
  → ✅ Local state (useState trong component đó)

2+ components cùng cấp cần data?
  → ✅ Lift state lên component cha chung

Nhiều component ở xa nhau trong tree cần data?
  → ✅ Context API hoặc state management library

Data từ server cần cache/sync?
  → ✅ Server state library (React Query, SWR)
```

| Loại State | Ví dụ | Giải pháp |
|---|---|---|
| **UI state** (local) | Form input, modal open/close, tooltip | `useState` |
| **Shared UI state** | Active tab, selected filter | Lift state up |
| **App-wide state** | User auth, theme, language | Context API |
| **Server state** | API data, cached responses | React Query / SWR |
| **Complex state** | Shopping cart, multi-step form | `useReducer` hoặc Zustand/Redux |

### 5. So sánh với MVVM/Provider patterns từ Mobile

| Khái niệm | React | Flutter (Provider/BLoC) | Android (MVVM) |
|---|---|---|---|
| **Local state** | `useState` | `StatefulWidget` + `setState` | LiveData trong ViewModel |
| **Shared state** | Lift state up / Context | `Provider` / `InheritedWidget` | Shared ViewModel |
| **Side effects** | `useEffect` | `initState` + `didChangeDependencies` | ViewModel `init{}` |
| **Global state** | Context + useReducer | `ChangeNotifierProvider` ở root | Hilt + Repository pattern |
| **Data flow** | Unidirectional (top-down props) | Unidirectional (Provider → Consumer) | ViewModel → View (observe) |
| **State update** | Setter → re-render | `notifyListeners()` → rebuild | `setValue()` → observer notified |

**Key insight:** React và Flutter đều theo **unidirectional data flow** — state đi từ trên xuống, events đi từ dưới lên. Android MVVM cũng tương tự với observer pattern.

```
React:                    Flutter:                  Android MVVM:
Parent State              Provider                  ViewModel
    ↓ props                   ↓ context                 ↓ LiveData
Child Component           Consumer Widget            Fragment/Activity
    ↑ callback                ↑ method call              ↑ user action
Parent updates state      Provider notifies          ViewModel updates
```

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: Giải thích cách `useState` hoạt động bên trong React?

**Trả lời:**

Khi bạn gọi `useState(initialValue)`:

1. **Lần render đầu tiên**: React tạo một "slot" trong bộ nhớ nội bộ, lưu `initialValue` vào đó
2. **Trả về**: `[currentValue, setterFunction]`
3. **Khi gọi setter**: React lưu giá trị mới → **schedule re-render** (không update ngay lập tức!)
4. **Re-render**: React gọi lại function component, `useState` lần này trả về giá trị **mới**

```
Render 1: useState(0) → count = 0
  User click → setCount(1) → schedule re-render
Render 2: useState(0) → count = 1 (React đọc từ slot, bỏ qua initialValue)
  User click → setCount(2) → schedule re-render
Render 3: useState(0) → count = 2
```

**Lưu ý quan trọng — Batching:**

```jsx
function handleClick() {
  setCount(count + 1);  // schedule: count = 0 + 1 = 1
  setCount(count + 1);  // schedule: count = 0 + 1 = 1 (vẫn dùng count cũ!)
  // Kết quả: count = 1, KHÔNG PHẢI 2!

  // Fix: dùng functional update
  setCount(prev => prev + 1);  // prev = 0 → 1
  setCount(prev => prev + 1);  // prev = 1 → 2
  // Kết quả: count = 2 ✅
}
```

**Quy tắc hooks:**
- Chỉ gọi hooks ở **top level** — không trong if/for/nested function
- Chỉ gọi hooks trong **React function component** hoặc **custom hook**
- Thứ tự gọi hooks phải **nhất quán** giữa các lần render

---

### ❓ Câu 2: useEffect cleanup function dùng khi nào? Cho ví dụ memory leak nếu không cleanup?

**Trả lời:**

**Cleanup function** chạy trong 2 trường hợp:
1. **Trước khi effect chạy lại** (khi dependencies thay đổi)
2. **Khi component unmount** (bị gỡ khỏi DOM)

**Ví dụ memory leak — không cleanup:**

```jsx
// ❌ Memory leak — event listener không bao giờ được gỡ
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // Không có cleanup → mỗi lần re-render thêm 1 listener mới!
  });

  return <p>Width: {width}</p>;
}
```

Nếu component render 10 lần → 10 event listeners vẫn active → memory leak!

```jsx
// ✅ Có cleanup — chỉ 1 listener hoạt động
function WindowSize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);  // cleanup!
    };
  }, []);  // chỉ mount/unmount

  return <p>Width: {width}</p>;
}
```

**Ví dụ khác — race condition khi fetch:**

```jsx
// ❌ Race condition — response cũ có thể đến sau response mới
useEffect(() => {
  fetch(`/api/user/${id}`).then(res => res.json()).then(setUser);
}, [id]);

// ✅ Dùng cleanup để cancel
useEffect(() => {
  let cancelled = false;  // flag

  fetch(`/api/user/${id}`)
    .then(res => res.json())
    .then(data => {
      if (!cancelled) setUser(data);  // chỉ set nếu chưa bị cancel
    });

  return () => { cancelled = true; };  // cleanup: đánh dấu cancel
}, [id]);
```

---

### ❓ Câu 3: Khi nào cần lifting state up? Cho ví dụ cụ thể?

**Trả lời:**

**Cần lifting state up khi:**
- Hai hoặc nhiều component **cùng cấp (siblings)** cần **đọc hoặc thay đổi cùng một dữ liệu**
- Một component cần **phản ứng** với sự thay đổi từ component khác

**Quy trình:**
1. Xác định **component cha chung gần nhất**
2. Đưa state lên component cha
3. Truyền state value + setter callback xuống các con qua props

**Ví dụ — Search + Filter + Results:**

```jsx
// ❌ Trước: mỗi component giữ state riêng → không đồng bộ
function SearchBar() {
  const [query, setQuery] = useState('');  // state riêng
  // Results không biết query là gì!
}

function FilterPanel() {
  const [category, setCategory] = useState('all');  // state riêng
  // Results không biết filter là gì!
}

// ✅ Sau: lift state lên App
function App() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [products, setProducts] = useState([]);

  // Filter logic ở đây — nơi có đầy đủ data
  const filtered = products
    .filter(p => p.name.includes(query))
    .filter(p => category === 'all' || p.category === category);

  return (
    <div>
      <SearchBar query={query} onQueryChange={setQuery} />
      <FilterPanel category={category} onCategoryChange={setCategory} />
      <ProductList items={filtered} />
    </div>
  );
}
```

---

### ❓ Câu 4: So sánh cách quản lý state trong React với Provider pattern trong Flutter?

**Trả lời:**

| Aspect | React (useState + Context) | Flutter (Provider) |
|--------|---------------------------|-------------------|
| **Khai báo state** | `const [count, setCount] = useState(0)` | `class Counter extends ChangeNotifier { int _count = 0; }` |
| **Cung cấp state** | `<MyContext.Provider value={state}>` | `ChangeNotifierProvider(create: (_) => Counter())` |
| **Tiêu thụ state** | `useContext(MyContext)` | `context.watch<Counter>()` hoặc `Consumer<Counter>` |
| **Update state** | `setState(newValue)` → re-render | `notifyListeners()` → rebuild dependents |
| **Scope** | Provider bọc ở đâu thì children đó access được | Provider bọc ở đâu thì descendants đó access được |
| **Re-render** | Component dùng context re-render toàn bộ | `watch` rebuild widget, `read` không rebuild |

**Tương đồng chính:**
- Cả hai đều dùng **tree-based propagation** — state provider ở trên, consumers ở dưới
- Cả hai đều **unidirectional** — data đi xuống, events đi lên
- Cả hai đều re-render/rebuild khi state thay đổi

**Khác biệt chính:**
- React re-render **toàn bộ component** khi context thay đổi (cần `useMemo`/`React.memo` để tối ưu)
- Flutter Provider có **granular rebuild** — `watch` vs `read` cho phép kiểm soát chính xác widget nào rebuild

---

### ❓ Câu 5: Giải thích dependency array trong useEffect — tại sao nó quan trọng?

**Trả lời:**

Dependency array cho React biết **khi nào cần chạy lại** effect. React so sánh dependencies giữa render hiện tại và render trước bằng `Object.is()`.

**Ví dụ minh họa:**

```jsx
function SearchResults({ query, category }) {
  const [results, setResults] = useState([]);

  // ❌ Thiếu dependency → stale closure bug
  useEffect(() => {
    fetch(`/api/search?q=${query}&cat=${category}`)
      .then(res => res.json())
      .then(setResults);
  }, [query]);  // quên category → search không update khi đổi category!

  // ✅ Đầy đủ dependencies
  useEffect(() => {
    fetch(`/api/search?q=${query}&cat=${category}`)
      .then(res => res.json())
      .then(setResults);
  }, [query, category]);  // chạy lại khi query HOẶC category thay đổi
}
```

**Các lỗi phổ biến:**

```jsx
// ❌ Lỗi 1: Object/Array mới mỗi render → effect chạy vô hạn
useEffect(() => {
  fetchData(options);
}, [{ page: 1, limit: 10 }]);  // object literal → reference mới mỗi render!

// ✅ Fix: dùng primitive values hoặc useMemo
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]);  // primitive → so sánh giá trị

// ❌ Lỗi 2: Function dependency → re-create mỗi render
useEffect(() => {
  const data = processData();
  setResult(data);
}, [processData]);  // function mới mỗi render → infinite loop!

// ✅ Fix: dùng useCallback
const processData = useCallback(() => {
  // ...
}, [rawData]);
```

**Quy tắc vàng:** Luôn khai báo **mọi giá trị** mà effect sử dụng trong dependency array. Dùng ESLint rule `react-hooks/exhaustive-deps` để tự động kiểm tra.

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| React Official - useState | https://react.dev/reference/react/useState |
| React Official - useEffect | https://react.dev/reference/react/useEffect |
| React Official - Sharing State Between Components | https://react.dev/learn/sharing-state-between-components |
| React Official - You Might Not Need an Effect | https://react.dev/learn/you-might-not-need-an-effect |
| React Official - Synchronizing with Effects | https://react.dev/learn/synchronizing-with-effects |
| Dan Abramov - A Complete Guide to useEffect | https://overreacted.io/a-complete-guide-to-useeffect/ |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**21/09 - Mon**) bạn sẽ học **TypeScript for Web & API Consumption** — TypeScript fundamentals, typing API responses, fetch/axios với async/await, và error handling cho network calls. Hiểu cách React state hoạt động hôm nay sẽ giúp bạn type state và props chính xác hơn với TypeScript.
