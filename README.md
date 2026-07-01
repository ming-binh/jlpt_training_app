# JLPT AI Tutor - Hướng dẫn Cài đặt & Khởi chạy

JLPT AI Tutor là một hệ thống Full-stack hoàn chỉnh dành riêng cho việc luyện thi tiếng Nhật. Hệ thống bao gồm:
- **Backend (Spring Boot 3.2)**: Quản lý Logic, Security (JWT), và đóng vai trò làm Orchestrator gọi đến Google Gemini API (đóng vai trò gia sư "Sensei").
- **Frontend (React 18 + Vite + TypeScript)**: Giao diện người dùng theo phong cách **Postman Dark Workbench** (chuyên nghiệp, mượt mà, tối màu để tập trung code/học).

---

## 🛠 Yêu cầu Hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Java 17** (JDK 17 trở lên)
- **Node.js** (v18 trở lên) & **npm** (Dùng cho Frontend)
- **Maven** (không bắt buộc vì đã có sẵn Maven Wrapper `.mvn/wrapper` trong dự án)
- **PostgreSQL** (chỉ cần nếu muốn chạy ở môi trường Production)

---

## ⚙️ Cấu hình Môi trường (.env)

Dự án sử dụng file `.env` ở thư mục gốc để quản lý các cấu hình nhạy cảm.

1. Copy file `.env.example` và đổi tên thành `.env`.
2. Mở file `.env` và cấu hình các giá trị cần thiết:

```env
# Lấy API key tại: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# JWT Secret Key (Tự tạo một chuỗi ngẫu nhiên dài ít nhất 256 bits)
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Cấu hình Database (Dùng cho Production)
DB_URL=jdbc:postgresql://localhost:5432/jlpt_tutor
DB_USERNAME=postgres
DB_PASSWORD=postgres
```
> **Quan trọng:** Bạn BẮT BUỘC phải điền `GEMINI_API_KEY` để AI hoạt động và `JWT_SECRET` để hệ thống Đăng nhập (Auth) hoạt động.

---

## 🚀 Cách Khởi chạy Dự án

Để chạy ứng dụng hoàn chỉnh, bạn cần bật cả Backend và Frontend chạy song song ở 2 cửa sổ Terminal khác nhau.

### 1. Khởi chạy Backend (Spring Boot)

Mặc định dự án đang cấu hình chạy ở profile `dev` sử dụng database **H2 in-memory** (tự động tạo DB, không cần cài PostgreSQL).

Mở terminal tại thư mục gốc của dự án:

**Windows:**
```bash
./mvnw.cmd spring-boot:run
```
*(Nếu PowerShell báo lỗi không tìm thấy file, có thể chạy trực tiếp bằng java)*:
```bash
java "-Dmaven.multiModuleProjectDirectory=." -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain spring-boot:run
```

**macOS/Linux:**
```bash
./mvnw spring-boot:run
```

Backend sẽ chạy ở cổng `http://localhost:8080`.
- H2 Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:jlpt_tutor_dev`, Username: `sa`)

### 2. Khởi chạy Frontend (React + Vite)

Mở một cửa sổ terminal mới và trỏ vào thư mục `frontend/`:

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy ở cổng `http://localhost:5173`. 
> Lúc này bạn có thể mở trình duyệt, truy cập `http://localhost:5173`, tiến hành **Sign Up** một tài khoản mới và trải nghiệm chat với AI Tutor!

---

## 📝 Cách Test API thủ công (Postman / REST Client)

Dự án có sẵn file **`api-tests.http`** ở thư mục gốc. Hệ thống đã được bảo mật bằng **Spring Security + JWT**.
Để gọi API `/api/ai/chat`, bạn phải làm theo luồng sau:

1. **Đăng ký / Đăng nhập** gọi tới `/api/auth/login` hoặc `/api/auth/register`.
2. Copy chuỗi `token` được trả về từ response.
3. Gắn token vào Header khi gọi các API khác:
```http
Authorization: Bearer <nhập_token_vào_đây>
```

Ví dụ CURL request cho Chat AI:
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_CỦA_BẠN>" \
  -d '{
    "useCase": "GRAMMAR_EXPLAIN",
    "params": {
      "user_message": "Giải thích ngữ pháp 〜てもいいですか"
    }
  }'
```

---

## 📚 Tài liệu tham khảo quan trọng (Dành cho Developer)

Khi tham gia phát triển dự án, bạn BẮT BUỘC phải tuân thủ các quy tắc trong các file sau:

1. **[CLAUDE.md](./CLAUDE.md) & [SKILL.md](./ai-prompts/SKILL.md)**: Quy tắc về hành vi code, luôn ưu tiên code đơn giản, rõ ràng, thiết kế hướng mục tiêu, không over-engineering.
2. **[AGENT.md](./AGENT.md)**: Chứa TOÀN BỘ quy tắc về Prompt Strategy, cấu trúc JSON trả về của AI, và thiết kế của các lớp giao tiếp với Gemini.
3. **[DESIGN.md](./frontend/DESIGN.md)**: Triết lý thiết kế UI/UX của Frontend. Sử dụng giao diện Postman Dark Workbench (Màu nền Canvas `#1B1B1B`, điểm nhấn Cam `#FF6C37` và dùng font Monospace cho dữ liệu). Không sử dụng Glassmorphism hay gradient sặc sỡ.
