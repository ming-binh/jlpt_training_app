# JLPT AI Tutor - Hướng dẫn Cài đặt & Khởi chạy

Dự án JLPT AI Tutor là một backend application được xây dựng với Spring Boot 3.2, cung cấp API cho ứng dụng học tiếng Nhật. Hệ thống tích hợp với Google Gemini API đóng vai trò là một gia sư AI ("Sensei") để giải thích ngữ pháp, chấm bài viết, và trò chuyện bằng tiếng Nhật.

---

## 🛠 Yêu cầu Hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt các công cụ sau:
- **Java 17** (JDK 17 trở lên)
- **Maven** (không bắt buộc vì đã có sẵn Maven Wrapper `.mvn/wrapper` trong dự án)
- **PostgreSQL** (chỉ cần nếu muốn chạy ở môi trường Production)

---

## ⚙️ Cấu hình Môi trường (.env)

Dự án sử dụng file `.env` để quản lý các cấu hình nhạy cảm.

1. Tại thư mục gốc của dự án, bạn sẽ thấy file `.env.example`.
2. Copy file `.env.example` và đổi tên thành `.env` (hoặc copy nội dung sang file `.env` mới nếu file đã tồn tại).
3. Mở file `.env` và cấu hình các giá trị cần thiết:

```env
# Lấy API key tại: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-1.5-flash

# Cấu hình Database (Chỉ dùng cho Production)
DB_URL=jdbc:postgresql://localhost:5432/jlpt_tutor
DB_USERNAME=postgres
DB_PASSWORD=postgres
```
> **Quan trọng:** Bạn BẮT BUỘC phải điền `GEMINI_API_KEY` để AI có thể hoạt động.

---

## 🚀 Cách Khởi chạy Dự án

Dự án có 2 profile chính là `dev` và `prod`. Mặc định dự án đang cấu hình chạy ở `dev`.

### 1. Khởi chạy môi trường Dev (Khuyên dùng khi code)

Môi trường `dev` sử dụng database **H2 in-memory**, nghĩa là bạn không cần cài đặt database bên ngoài. Dữ liệu sẽ tự tạo khi chạy và tự xoá khi tắt app.

Mở terminal/command prompt tại thư mục gốc của dự án và chạy lệnh:

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

App sẽ chạy ở cổng `8080`.
- Truy cập DB Console tại: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:jlpt_tutor_dev` (Username: `sa`, Password: để trống)

### 2. Khởi chạy môi trường Production

Môi trường production yêu cầu **PostgreSQL**.

1. Đảm bảo PostgreSQL đang chạy và bạn đã tạo một database tên là `jlpt_tutor`.
2. Kiểm tra lại thông tin `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` trong file `.env`.
3. Chạy lệnh start với profile mặc định là prod (bằng cách ghi đè biến môi trường):

**Windows/macOS/Linux:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=prod
```

---

## 🧪 Chạy Unit Test

Để đảm bảo code hoạt động chính xác trước khi commit, hãy chạy toàn bộ test suit:

**Windows:**
```bash
java "-Dmaven.multiModuleProjectDirectory=." -classpath ".mvn\wrapper\maven-wrapper.jar" org.apache.maven.wrapper.MavenWrapperMain test
```

**macOS/Linux:**
```bash
./mvnw test
```

---

## 📝 Cách Test API (Thử nghiệm)

Dự án có sẵn file **`api-tests.http`** chứa các mẫu request. Nếu bạn dùng IDE IntelliJ IDEA, VS Code (với extension REST Client), bạn có thể mở file này và click nút "Send Request" trực tiếp.

**Lưu ý khi gọi API (`/api/ai/chat`):**
Cần gửi kèm Header `X-User-Id` để hệ thống biết bạn là ai và tự động lưu/load lịch sử hội thoại cũng như thông tin user từ Database.

Ví dụ CURL request:
```bash
curl -X POST http://localhost:8080/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "X-User-Id: user-001" \
  -d '{
    "useCase": "GRAMMAR_EXPLAIN",
    "params": {
      "grammar_point": "〜てもいいですか",
      "jlpt_level": "N4",
      "user_message": "Giải thích ngữ pháp này cho em"
    }
  }'
```

---

## 📚 Tài liệu tham khảo quan trọng (Dành cho Developer)

Khi tham gia phát triển dự án, bạn BẮT BUỘC phải tuân thủ các quy tắc trong 2 file sau:

1. **[CLAUDE.md](./CLAUDE.md)**: Quy tắc về hành vi code, luôn ưu tiên đơn giản, rõ ràng, không over-engineering.
2. **[AGENT.md](./AGENT.md)**: Chứa TOÀN BỘ quy tắc về Prompt Strategy, cấu trúc JSON trả về của AI, và thiết kế của các lớp giao tiếp với Gemini. Không tự ý sửa đổi Prompt nếu chưa hiểu rõ file này.
