# 📋 Learning Review — Ngày 18/09/2026 (Thứ Sáu)

---

## 🎯 Thông tin chung

| Mục | Chi tiết |
|-----|---------|
| **Ngày** | 18/09/2026 (Fri) |
| **Chủ đề** | **Kickoff & Web Frontend Fundamentals** |
| **Session Type** | Self-Study |
| **Report Required** | ✅ Yes |

---

## 📚 Nội dung học chính

> **Intro to web full-stack mindset; HTML/CSS/DOM basics vs mobile UI paradigms; how the web request/response model differs from mobile apps**

---

## 🔍 Key Concepts cần nắm vững

### 1. HTML Semantics & CSS Box Model

- Hiểu các thẻ semantic HTML5: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Nắm vững **CSS Box Model**: `content` → `padding` → `border` → `margin`
- Phân biệt `box-sizing: content-box` vs `box-sizing: border-box`

### 2. How the DOM Works

- DOM (Document Object Model) là gì — cây cấu trúc đại diện cho HTML document
- Cách browser parse HTML → xây dựng DOM tree → render
- DOM manipulation cơ bản: `getElementById`, `querySelector`, `addEventListener`
- So sánh DOM với cách mobile apps render UI (widget tree trong Flutter, View hierarchy trong Android)

### 3. Client-Server Request/Response Cycle for Web Apps

- Luồng hoạt động: **Browser → HTTP Request → Server → HTTP Response → Browser renders**
- Các phương thức HTTP: `GET`, `POST`, `PUT`, `DELETE`
- Cấu trúc một HTTP request/response: headers, body, status codes
- Stateless nature của HTTP

### 4. So sánh Web vs Mobile App Lifecycle/Navigation

- Web: URL-based navigation, page reload vs SPA (Single Page Application)
- Mobile: Activity/Fragment lifecycle (Android), ViewController lifecycle (iOS), Widget lifecycle (Flutter)
- Web: Stateless by default (cần cookies/localStorage/sessionStorage)
- Mobile: State managed in-memory (ViewModel, Provider, BLoC...)

---

## ✅ Câu hỏi & Trả lời ôn tập

---

### ❓ Câu 1: Kể tên ít nhất 5 thẻ semantic HTML5 và giải thích khi nào dùng chúng?

**Trả lời:**

| Thẻ | Khi nào dùng |
|-----|-------------|
| `<header>` | Phần đầu trang hoặc đầu một section — chứa logo, tiêu đề, navigation |
| `<nav>` | Khu vực chứa các liên kết điều hướng chính (menu, breadcrumb, sidebar links) |
| `<main>` | Nội dung chính và duy nhất của trang — mỗi trang chỉ có **1 thẻ `<main>`** |
| `<section>` | Nhóm nội dung có cùng chủ đề — ví dụ: "Giới thiệu", "Dịch vụ", "Liên hệ" |
| `<article>` | Nội dung độc lập, có thể tái sử dụng — ví dụ: bài blog, bình luận, card sản phẩm |
| `<footer>` | Phần cuối trang hoặc cuối một section — chứa copyright, liên kết phụ |
| `<aside>` | Nội dung phụ liên quan gián tiếp — sidebar, quảng cáo, "bài viết liên quan" |

**Tại sao dùng semantic?** Giúp trình duyệt, search engine (SEO) và screen reader (accessibility) hiểu đúng cấu trúc nội dung, thay vì dùng `<div>` cho mọi thứ.

---

### ❓ Câu 2: Vẽ/mô tả CSS Box Model và giải thích sự khác biệt giữa `content-box` và `border-box`?

**Trả lời:**

**CSS Box Model** — mọi element trong HTML đều là một "hộp" gồm 4 lớp lồng nhau:

```
┌──────────────────────────────── margin ─────────────────────────────────┐
│  ┌──────────────────────────── border ─────────────────────────────┐    │
│  │  ┌──────────────────────── padding ────────────────────────┐    │    │
│  │  │  ┌──────────────────── content ───────────────────┐     │    │    │
│  │  │  │                                                │     │    │    │
│  │  │  │          Nội dung hiển thị (text, img)         │     │    │    │
│  │  │  │                                                │     │    │    │
│  │  │  └────────────────────────────────────────────────┘     │    │    │
│  │  └────────────────────────────────────────────────────────┘    │    │
│  └────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────────────────┘
```

**So sánh `content-box` vs `border-box`:**

| | `content-box` (mặc định) | `border-box` |
|---|---|---|
| `width` tính cho | Chỉ phần **content** | **content + padding + border** |
| Ví dụ: `width: 200px; padding: 20px; border: 2px` | Tổng chiều rộng = 200 + 20×2 + 2×2 = **244px** | Tổng chiều rộng = **200px** (content tự co lại) |
| Khi nào dùng | Ít dùng trong thực tế | ✅ Phổ biến hơn, dễ layout hơn |

**Best practice:** Hầu hết dự án thực tế đều dùng reset toàn cục:

```css
*, *::before, *::after {
  box-sizing: border-box;
}
```

---

### ❓ Câu 3: Giải thích DOM là gì và browser tạo DOM tree như thế nào?

**Trả lời:**

**DOM (Document Object Model)** là một cây cấu trúc dạng object mà browser tạo ra từ file HTML. Mỗi thẻ HTML trở thành một **node** trong cây, cho phép JavaScript đọc và thay đổi nội dung trang.

**Quá trình browser tạo DOM tree:**

```
1. Nhận HTML raw bytes từ server
        ↓
2. Chuyển bytes → characters (dựa trên encoding, ví dụ UTF-8)
        ↓
3. Tokenize — nhận diện các thẻ mở/đóng: <html>, <body>, <p>...
        ↓
4. Tạo Nodes — mỗi token thành một DOM node (Element, Text, Attribute...)
        ↓
5. Xây dựng DOM Tree — sắp xếp nodes theo quan hệ cha-con
```

**Ví dụ:**

```html
<html>
  <body>
    <h1>Hello</h1>
    <p>World</p>
  </body>
</html>
```

Tạo ra DOM tree:

```
document
  └── html
        └── body
              ├── h1
              │    └── "Hello" (text node)
              └── p
                   └── "World" (text node)
```

**Các cách thao tác DOM bằng JavaScript:**

```js
// Lấy element
document.getElementById('myId');
document.querySelector('.myClass');
document.querySelectorAll('p');

// Thay đổi nội dung
element.textContent = 'Nội dung mới';
element.innerHTML = '<strong>Bold text</strong>';

// Lắng nghe sự kiện
element.addEventListener('click', () => {
  console.log('Clicked!');
});
```

---

### ❓ Câu 4: Mô tả luồng request/response khi user truy cập một trang web?

**Trả lời:**

Khi bạn gõ `https://example.com` vào trình duyệt:

```
1. DNS Lookup
   Browser hỏi DNS server: "example.com có IP là gì?"
   → Nhận được IP: 93.184.216.34
        ↓
2. TCP Connection
   Browser mở kết nối TCP đến server qua IP:port (mặc định port 443 cho HTTPS)
   → Thực hiện TCP 3-way handshake (SYN → SYN-ACK → ACK)
        ↓
3. TLS Handshake (nếu HTTPS)
   Browser và server trao đổi certificate, thống nhất encryption
        ↓
4. HTTP Request
   Browser gửi request:
   ┌─────────────────────────────────┐
   │ GET / HTTP/1.1                  │
   │ Host: example.com              │
   │ Accept: text/html              │
   │ User-Agent: Chrome/...         │
   └─────────────────────────────────┘
        ↓
5. Server xử lý
   Server nhận request → xử lý logic → truy vấn database (nếu cần) → tạo response
        ↓
6. HTTP Response
   Server trả về:
   ┌─────────────────────────────────┐
   │ HTTP/1.1 200 OK                │
   │ Content-Type: text/html        │
   │                                │
   │ <html><body>...</body></html>  │
   └─────────────────────────────────┘
        ↓
7. Browser Rendering
   Browser nhận HTML → parse DOM → tải CSS/JS → render trang hiển thị
```

---

### ❓ Câu 5: So sánh ít nhất 3 điểm khác biệt giữa web app navigation vs mobile app navigation?

**Trả lời:**

| Tiêu chí | Web App | Mobile App |
|----------|---------|------------|
| **Cơ chế điều hướng** | Dựa trên **URL** — mỗi trang có một đường dẫn riêng (`/home`, `/about`) | Dựa trên **stack/route** — push/pop screens lên navigation stack |
| **Quản lý trạng thái trang** | Mặc định **không giữ state** khi chuyển trang (trừ SPA) — mỗi lần reload là mất hết | State **được giữ trong memory** — quay lại screen trước thường giữ nguyên data |
| **Back button** | Browser quản lý history stack (`window.history`) — user có thể back/forward tự do | OS quản lý back gesture/button — developer kiểm soát hành vi khi back |
| **Deep linking** | Tự nhiên — mọi trang đều có URL, có thể share/bookmark trực tiếp | Phải cấu hình riêng (Intent Filter trên Android, Universal Links trên iOS) |
| **Lifecycle** | Trang có thể bị destroy hoàn toàn khi navigate away (multi-page) hoặc chỉ unmount component (SPA) | Screens có lifecycle phức tạp: `onCreate` → `onResume` → `onPause` → `onDestroy` |
| **Caching/Offline** | Cần Service Worker để hoạt động offline | Có thể hoạt động offline mặc định vì app đã được cài đặt |

---

### ❓ Câu 6: Giải thích tại sao HTTP là stateless và cách web apps duy trì state?

**Trả lời:**

**HTTP là stateless** nghĩa là: **mỗi request là hoàn toàn độc lập** — server không nhớ bất kỳ thông tin nào từ request trước đó. Request thứ 2 không biết request thứ 1 đã làm gì.

**Tại sao thiết kế stateless?**
- Đơn giản hóa server — không cần lưu trạng thái cho hàng triệu client
- Dễ scale — bất kỳ server nào cũng xử lý được request mà không cần biết lịch sử
- Tin cậy hơn — server crash không mất session data

**Cách web apps duy trì state dù HTTP stateless:**

| Cơ chế | Mô tả | Dung lượng | Thời gian sống |
|--------|-------|------------|---------------|
| **Cookies** | Server gửi `Set-Cookie` header, browser tự động gửi kèm mỗi request sau đó | ~4KB | Có thể set expiry (session hoặc persistent) |
| **localStorage** | Lưu key-value ở client, không tự gửi lên server | ~5-10MB | Vĩnh viễn (cho đến khi xóa thủ công) |
| **sessionStorage** | Giống localStorage nhưng chỉ tồn tại trong tab hiện tại | ~5-10MB | Mất khi đóng tab |
| **JWT Token** | Server tạo token chứa thông tin user, client gửi kèm trong `Authorization` header | Tùy ý | Có expiry time |
| **Server-side Session** | Server lưu session data, gửi session ID qua cookie cho client | Không giới hạn | Tùy cấu hình server |

**Ví dụ thực tế — luồng đăng nhập:**

```
1. User gửi POST /login với username + password
2. Server xác thực → tạo JWT token → trả về cho client
3. Client lưu token vào localStorage hoặc cookie
4. Mỗi request sau đó, client gửi kèm:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
5. Server đọc token → biết user là ai → xử lý request
```

---

### ❓ Câu 7: Phân biệt SPA vs Multi-Page Application?

**Trả lời:**

| Tiêu chí | SPA (Single Page Application) | MPA (Multi-Page Application) |
|----------|-------------------------------|------------------------------|
| **Cách hoạt động** | Tải **1 file HTML duy nhất**, sau đó JavaScript cập nhật nội dung động mà không reload trang | Mỗi lần navigate, browser gửi request mới và **tải lại toàn bộ trang HTML** |
| **Tốc độ chuyển trang** | ⚡ Rất nhanh — chỉ fetch data (JSON) rồi render phía client | 🐌 Chậm hơn — phải tải lại cả HTML, CSS, JS |
| **First Load** | 🐌 Chậm hơn — phải tải toàn bộ JS bundle lần đầu | ⚡ Nhanh hơn — chỉ tải HTML cần thiết |
| **SEO** | ❌ Khó — content render bằng JS, search engine có thể không đọc được (cần SSR) | ✅ Tốt — content có sẵn trong HTML |
| **Ví dụ framework** | React, Vue, Angular | Next.js (SSR), PHP (Laravel), Django |
| **UX** | Mượt mà như app native — không bị "chớp trắng" khi chuyển trang | Có cảm giác "tải lại" mỗi khi chuyển trang |
| **Ví dụ thực tế** | Gmail, Google Maps, Trello | Wikipedia, trang tin tức truyền thống |

**Xu hướng hiện tại:** Kết hợp cả hai — dùng framework như **Next.js** hỗ trợ **SSR (Server-Side Rendering)** để có ưu điểm của cả SPA (mượt) và MPA (SEO tốt).

---

## 📖 Tài nguyên tham khảo

| Tài nguyên | Link |
|------------|------|
| MDN - HTML Basics | https://developer.mozilla.org/en-US/docs/Learn/HTML |
| MDN - CSS Box Model | https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_box_model |
| MDN - Introduction to the DOM | https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction |
| MDN - HTTP Overview | https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview |
| Web.dev - How browsers work | https://web.dev/articles/howbrowserswork |

---

## 🗓️ Nhìn trước

> Ngày tiếp theo (**19/09 - Sat**) bạn sẽ học **React fundamentals: components, JSX, props & state**. Việc nắm vững HTML/CSS/DOM hôm nay sẽ là nền tảng cần thiết để hiểu cách React render components lên DOM.
