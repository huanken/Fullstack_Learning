# 📋 Learning Review — Ngày 19/09/2026 (Thứ Bảy)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 19/09/2026 (Sat) |
| **Chủ đề** | **React Fundamentals: Components, JSX, Props & State** |
| **Session Type** | Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **JSX syntax; functional components; props vs state; component composition; rendering lists with keys**

---

## 🔍 Key Concepts cần nắm vững

### 1. JSX Syntax

- JSX (JavaScript XML) là phần mở rộng cú pháp cho JavaScript — cho phép viết "HTML" trong JS
- JSX **không phải HTML** — nó được Babel/compiler chuyển thành `React.createElement()` calls
- Quy tắc quan trọng:
  - Dùng `className` thay cho `class`
  - Dùng `htmlFor` thay cho `for`
  - Mọi thẻ phải được đóng: `<img />`, `<br />`
  - Chỉ trả về **1 root element** — dùng `<div>` hoặc `<>...</>` (Fragment) để bọc

```jsx
// JSX
const element = <h1 className="title">Hello, {name}!</h1>;

// Sau khi compile → React.createElement()
const element = React.createElement('h1', { className: 'title' }, `Hello, ${name}!`);
```

- **Expressions trong JSX**: Dùng `{}` để nhúng biểu thức JavaScript

```jsx
const user = { name: 'Huan', age: 25 };

return (
  <div>
    <p>Name: {user.name}</p>
    <p>Age: {user.age}</p>
    <p>Is Adult: {user.age >= 18 ? 'Yes' : 'No'}</p>
  </div>
);
```

### 2. Functional Components

- React component là **hàm JavaScript** trả về JSX
- Tên component **phải viết hoa chữ cái đầu** (PascalCase)
- Component giống như custom HTML tag — tái sử dụng được

```jsx
// Functional component đơn giản
function Greeting() {
  return <h1>Hello, World!</h1>;
}

// Arrow function
const Greeting = () => <h1>Hello, World!</h1>;

// Sử dụng component
function App() {
  return (
    <div>
      <Greeting />
      <Greeting />
    </div>
  );
}
```

- **So sánh với Mobile:**
  - React component ≈ Flutter Widget / Android XML Layout + ViewModel
  - Nhưng React component là **hàm thuần** — không có lifecycle class phức tạp

### 3. Props vs State

- **Props** (Properties): Dữ liệu truyền **từ component cha → con** — giống tham số hàm
- **State**: Dữ liệu **nội bộ** của component — thay đổi được, khi thay đổi sẽ trigger re-render

| | Props | State |
|---|---|---|
| **Nguồn gốc** | Từ component cha truyền xuống | Tự quản lý bên trong component |
| **Có thể thay đổi?** | ❌ Không (read-only đối với component nhận) | ✅ Có (qua `setState` hoặc `useState`) |
| **Mục đích** | Cấu hình component, truyền dữ liệu | Quản lý dữ liệu thay đổi theo thời gian |
| **Khi thay đổi** | Component cha re-render → con nhận props mới | Component tự re-render |
| **So sánh Mobile** | Constructor params trong Flutter Widget | State trong StatefulWidget / ViewModel |

```jsx
// Props — nhận từ bên ngoài
function UserCard({ name, email, avatar }) {
  return (
    <div className="card">
      <img src={avatar} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </div>
  );
}

// State — quản lý nội bộ
function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
}

// Kết hợp Props + State
function App() {
  return (
    <div>
      <UserCard name="Huan" email="huan@email.com" avatar="/avatar.jpg" />
      <Counter />
    </div>
  );
}
```

### 4. Component Composition

- **Composition** là pattern chính trong React — xây dựng UI phức tạp từ các component nhỏ
- Ưu tiên composition hơn inheritance (React không khuyến khích dùng class inheritance)
- **`children` prop** — cho phép truyền JSX vào bên trong component

```jsx
// Container component sử dụng children
function Card({ title, children }) {
  return (
    <div className="card">
      <h2 className="card-title">{title}</h2>
      <div className="card-body">
        {children}
      </div>
    </div>
  );
}

// Sử dụng composition
function App() {
  return (
    <div>
      <Card title="User Profile">
        <p>Name: Huan</p>
        <p>Role: Developer</p>
      </Card>

      <Card title="Statistics">
        <ul>
          <li>Posts: 42</li>
          <li>Followers: 128</li>
        </ul>
      </Card>
    </div>
  );
}
```

- **Specialization pattern** — tạo component chuyên biệt từ component tổng quát:

```jsx
function Button({ variant = 'default', children, ...props }) {
  return (
    <button className={`btn btn-${variant}`} {...props}>
      {children}
    </button>
  );
}

// Specialized buttons
const PrimaryButton = (props) => <Button variant="primary" {...props} />;
const DangerButton = (props) => <Button variant="danger" {...props} />;
```

### 5. Rendering Lists with Keys

- Dùng `map()` để render danh sách từ array
- Mỗi item **phải có `key` prop** — giúp React nhận diện item nào thay đổi/thêm/xóa
- `key` phải **unique** trong danh sách và **ổn định** (không dùng index nếu list có thể thay đổi thứ tự)

```jsx
function TodoList() {
  const todos = [
    { id: 1, text: 'Learn HTML', done: true },
    { id: 2, text: 'Learn CSS', done: true },
    { id: 3, text: 'Learn React', done: false },
  ];

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id} style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
          {todo.text}
        </li>
      ))}
    </ul>
  );
}
```

**Tại sao cần `key`?**

```
Không có key — React phải re-render toàn bộ list khi có thay đổi
Có key — React chỉ re-render item bị thay đổi (reconciliation algorithm)

Virtual DOM so sánh:
  Cũ: [A, B, C]
  Mới: [A, D, B, C]

  Không key: React nghĩ B→D, C→B, thêm C → 3 thao tác
  Có key:    React biết chỉ cần thêm D vào vị trí 1 → 1 thao tác
```

**Quy tắc chọn key:**

| ✅ Nên dùng | ❌ Không nên dùng |
|---|---|
| `id` từ database | `Math.random()` |
| Unique identifier có sẵn | `Date.now()` |
| Slug hoặc unique field | Array index (nếu list thay đổi thứ tự) |

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: JSX là gì và nó khác gì so với HTML?

**Trả lời:**

**JSX (JavaScript XML)** là một cú pháp mở rộng cho phép viết cấu trúc giống HTML bên trong JavaScript. Tuy trông giống HTML, nhưng JSX **không phải HTML** — nó được compile thành các lời gọi `React.createElement()`.

**Các điểm khác biệt chính:**

| HTML | JSX |
|------|-----|
| `class="title"` | `className="title"` |
| `for="email"` | `htmlFor="email"` |
| `onclick="fn()"` | `onClick={fn}` |
| `style="color: red"` | `style={{ color: 'red' }}` |
| Thẻ có thể không đóng: `<br>`, `<img>` | Bắt buộc đóng: `<br />`, `<img />` |
| Có thể return nhiều root elements | Chỉ return **1 root element** |
| Giá trị attribute là string | Giá trị attribute có thể là expression: `{variable}` |

**Ví dụ so sánh:**

```html
<!-- HTML -->
<label class="label" for="name">
  <input type="text" onclick="handleClick()">
</label>
```

```jsx
// JSX
<label className="label" htmlFor="name">
  <input type="text" onClick={handleClick} />
</label>
```

---

### ❓ Câu 2: Phân biệt Props và State? Khi nào dùng cái nào?

**Trả lời:**

| Tiêu chí | Props | State |
|----------|-------|-------|
| **Định nghĩa** | Dữ liệu truyền từ component cha xuống con | Dữ liệu nội bộ, do component tự quản lý |
| **Ai kiểm soát?** | Component cha | Component hiện tại |
| **Mutable?** | ❌ Không — immutable đối với component nhận | ✅ Có — thay đổi qua `useState` setter |
| **Trigger re-render?** | Khi cha thay đổi props → con re-render | Khi gọi setter → component re-render |

**Khi nào dùng Props:**
- Truyền dữ liệu/cấu hình từ cha sang con (tên, tiêu đề, callback function)
- Dữ liệu mà component con chỉ cần **đọc**, không cần **sửa**

**Khi nào dùng State:**
- Dữ liệu thay đổi theo tương tác người dùng (input value, toggle, counter)
- Dữ liệu cần trigger UI update khi thay đổi

**Ví dụ thực tế:**

```jsx
function SearchPage() {
  // State: query thay đổi khi user gõ
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState([]);

  return (
    <div>
      <SearchInput
        value={query}                    // Props: truyền giá trị xuống
        onChange={(e) => setQuery(e.target.value)}  // Props: truyền callback
      />
      <ResultList items={results} />      {/* Props: truyền data xuống */}
    </div>
  );
}
```

---

### ❓ Câu 3: Component composition là gì? Tại sao React ưu tiên composition hơn inheritance?

**Trả lời:**

**Component composition** là kỹ thuật xây dựng component phức tạp bằng cách **kết hợp nhiều component nhỏ lại với nhau**, thay vì kế thừa (inheritance).

**Tại sao ưu tiên composition?**

1. **Linh hoạt hơn** — Có thể thay đổi behavior bằng cách thay component con, không cần sửa class cha
2. **Dễ hiểu hơn** — Mỗi component có 1 nhiệm vụ rõ ràng, dễ đọc và debug
3. **Tránh "diamond problem"** — Không có vấn đề kế thừa đa tầng phức tạp
4. **Tái sử dụng tốt hơn** — Component nhỏ có thể dùng lại ở nhiều nơi

**Các pattern phổ biến:**

```jsx
// 1. Containment pattern — dùng children
function Modal({ title, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}

// 2. Specialization pattern — component chuyên biệt
function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <Modal title="Are you sure?">
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </Modal>
  );
}

// 3. Render props pattern — truyền hàm render qua props
function DataFetcher({ url, render }) {
  const [data, setData] = React.useState(null);
  // ... fetch data
  return render(data);
}
```

---

### ❓ Câu 4: Giải thích tại sao `key` quan trọng khi render list trong React?

**Trả lời:**

**`key`** là một prop đặc biệt giúp React **nhận diện từng item** trong danh sách khi thực hiện **reconciliation** (so sánh Virtual DOM cũ và mới).

**Không có key — vấn đề gì xảy ra?**

```jsx
// ❌ Không có key
{items.map(item => <li>{item.name}</li>)}
```

Khi thêm item vào đầu list:
```
Cũ: [Apple, Banana]
Mới: [Cherry, Apple, Banana]

React so sánh theo thứ tự:
  Position 0: Apple → Cherry  → RE-RENDER (không cần thiết)
  Position 1: Banana → Apple  → RE-RENDER (không cần thiết)
  Position 2: (không có) → Banana → THÊM MỚI

→ 3 thao tác DOM, dù chỉ cần 1 (thêm Cherry vào đầu)
```

**Có key — React tối ưu được:**

```jsx
// ✅ Có key
{items.map(item => <li key={item.id}>{item.name}</li>)}
```

```
Cũ: [Apple(1), Banana(2)]
Mới: [Cherry(3), Apple(1), Banana(2)]

React so sánh theo key:
  key=1: Apple → Apple     → GIỮ NGUYÊN
  key=2: Banana → Banana   → GIỮ NGUYÊN
  key=3: (không có) → Cherry → THÊM MỚI

→ Chỉ 1 thao tác DOM — thêm Cherry vào đúng vị trí
```

**Tại sao không nên dùng index làm key?**

```jsx
// ❌ Dùng index
{items.map((item, index) => <li key={index}>{item.name}</li>)}
```

Nếu list bị **sắp xếp lại, xóa, hoặc thêm vào giữa**, index sẽ thay đổi → React liên kết sai item với sai key → bug UI (ví dụ: input value bị gán sai cho item khác).

---

### ❓ Câu 5: Viết một component React hoàn chỉnh sử dụng props, state, composition và list rendering?

**Trả lời:**

```jsx
// TaskItem component — nhận props
function TaskItem({ task, onToggle, onDelete }) {
  return (
    <li className={task.done ? 'completed' : ''}>
      <input
        type="checkbox"
        checked={task.done}
        onChange={() => onToggle(task.id)}
      />
      <span>{task.text}</span>
      <button onClick={() => onDelete(task.id)}>🗑️</button>
    </li>
  );
}

// Card container — composition với children
function Card({ title, children }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <div className="card-content">{children}</div>
    </div>
  );
}

// App component — quản lý state
function TodoApp() {
  const [tasks, setTasks] = React.useState([
    { id: 1, text: 'Learn HTML', done: true },
    { id: 2, text: 'Learn CSS', done: true },
    { id: 3, text: 'Learn React', done: false },
  ]);
  const [input, setInput] = React.useState('');

  const addTask = () => {
    if (!input.trim()) return;
    setTasks([...tasks, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <Card title="📝 Todo List">
      {/* Input area */}
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add new task..."
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>

      {/* List rendering with keys */}
      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}           // ← key unique cho mỗi item
            task={task}             // ← props: data
            onToggle={toggleTask}   // ← props: callback
            onDelete={deleteTask}   // ← props: callback
          />
        ))}
      </ul>

      {/* Summary */}
      <p>{tasks.filter(t => !t.done).length} tasks remaining</p>
    </Card>
  );
}
```

---

### ❓ Câu 6: So sánh React component model với widget model của Flutter?

**Trả lời:**

| Tiêu chí | React (Functional Component) | Flutter (Widget) |
|----------|-----|--------|
| **Đơn vị UI** | Function trả về JSX | Class extends Widget |
| **Loại component** | Chỉ có Functional (+ hooks) | StatelessWidget vs StatefulWidget |
| **Props** | Truyền qua function parameters | Truyền qua constructor |
| **State** | `useState` hook | `State<T>` class với `setState()` |
| **Rendering** | JSX → Virtual DOM → Real DOM | Widget tree → Element tree → RenderObject |
| **Rebuild trigger** | State change → re-execute function | `setState()` → `build()` được gọi lại |
| **Composition** | `children` prop, nesting components | `child`/`children` widget parameter |
| **List rendering** | `array.map()` với `key` | `ListView.builder()` |

**Ví dụ so sánh:**

```jsx
// React
function Counter({ initialValue }) {
  const [count, setCount] = React.useState(initialValue);
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

```dart
// Flutter
class Counter extends StatefulWidget {
  final int initialValue;
  const Counter({required this.initialValue});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  late int count = widget.initialValue;

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      Text('$count'),
      ElevatedButton(
        onPressed: () => setState(() => count++),
        child: Text('+'),
      ),
    ]);
  }
}
```

**Nhận xét:** React functional component **gọn hơn** nhờ hooks, không cần tách StatelessWidget/StatefulWidget. Flutter cần boilerplate nhiều hơn nhưng có **type safety** mạnh hơn với Dart.

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| React Official - Thinking in React | https://react.dev/learn/thinking-in-react |
| React Official - Your First Component | https://react.dev/learn/your-first-component |
| React Official - Passing Props | https://react.dev/learn/passing-props-to-a-component |
| React Official - State: A Component's Memory | https://react.dev/learn/state-a-components-memory |
| React Official - Rendering Lists | https://react.dev/learn/rendering-lists |
| React Official - Writing Markup with JSX | https://react.dev/learn/writing-markup-with-jsx |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**20/09 - Sun**) bạn sẽ học **React hooks & basic state management** — tập trung vào `useState`, `useEffect`, lifting state up, và so sánh với MVVM/Provider patterns từ mobile. Nắm vững props/state/composition hôm nay là nền tảng để hiểu cách quản lý state phức tạp hơn.
