# 🌸 NIHON JOURNEY — JLPT AI TUTOR (N5 ➔ N3)

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20%26%20Auth-emerald.svg)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

**Nihon Journey** là hệ thống Full-stack học & luyện thi tiếng Nhật thông minh từ cấp độ **JLPT N5 đến N3**. Ứng dụng kết hợp giữa **Lộ trình bài học cấu trúc**, kho dữ liệu từ vựng - kanji - ngữ pháp phong phú, và **Gia sư AI Sensei** tương tác 24/7.

---

## 🌟 Tính Năng Nổi Bật

### 1. 🎓 Lộ Trình Bài Học Cấu Trúc (`Lesson` & `QuizSession`)
- Chia nhỏ dữ liệu thành các Bài học chuẩn hóa cho **N5, N4, N3**:
  - **Bài học Từ vựng**: 15 từ / bài
  - **Bài học Kanji**: 12 chữ / bài
  - **Bài học Ngữ pháp**: 10 cấu trúc / bài
- **Sinh bài tập Quiz tự động**: Kết hợp Flashcard lật thẻ và Trắc nghiệm 4 lựa chọn.
- **Tối ưu hóa Batch Query**: Tốc độ xử lý siêu tốc, giảm từ 4.000+ câu lệnh SQL xuống chỉ **3 SQL queries** trên 1 request.

### 2. 📖 Kho Từ Vựng Tiếng Nhật (3,000+ Từ)
- Tìm kiếm tức thì, lọc theo trình độ (N5 ➔ N3), hiển thị Furigana, ví dụ thực tế và phát âm.
- Đánh dấu tương tác **`🟢 Đã thuộc (+10 XP)`** hoặc **`🔴 Cần học lại`** lưu trực tiếp vào cơ sở dữ liệu.

### 3. 漢 Kho Kanji (600+ Chữ Hán)
- Tra cứu âm On/Kun, số nét, ý nghĩa Hán Việt và từ ghép liên quan.

### 4. 文 Cấu Trúc Ngữ Pháp (50+ Mẫu)
- Công thức chia động từ, giải thích sắc thái sử dụng và câu ví dụ song ngữ Nhật - Việt.

### 5. 🤖 Trợ Lý Gia Sư AI Sensei (24/7)
- Tích hợp đa mô hình AI tiên tiến: **Google Gemini 1.5 Flash** & **Groq Llama 3.3 70B**.
- Giải thích ngữ pháp, sửa bài viết, dịch câu và luyện hội thoại phản xạ.

### 6. 🔥 Trang Cá Nhân & Thống Kê Chuỗi Ngày Học (Streak)
- Theo dõi chuỗi ngày học liên tục (7-day streak tracker), điểm kinh nghiệm XP, cấp độ mục tiêu và phần kỹ năng cần cải thiện.

---

## 🏗️ Kiến Trúc & Công Nghệ (Tech Stack)

```
                        ┌───────────────────────────────┐
                        │   React 18 + Vite + TS        │
                        │   (Nihon Journey UI / Tailwind)│
                        └──────────────┬────────────────┘
                                       │ REST API (Axios + Supabase Bearer JWT)
                                       ▼
                        ┌───────────────────────────────┐
                        │   Spring Boot 3.2 (Java 17)   │
                        │   • Spring Security + JWT     │
                        │   • HikariCP (20 connections) │
                        │   • JPA / Hibernate           │
                        └──────┬─────────────────┬──────┘
                               │                 │
            ┌──────────────────┴──┐           ┌──┴──────────────────┐
            ▼                     ▼           ▼                     ▼
┌───────────────────────┐ ┌───────────────┐ ┌───────────────────┐ ┌────────────────┐
│ Supabase PostgreSQL   │ │ Supabase Auth │ │ Google Gemini API │ │ Groq Llama 3.3 │
│ (3,000+ Vocab/Kanji)  │ │ (JWT Session) │ │ (Sensei Tutor AI) │ │ (Fast AI Chat) │
└───────────────────────┘ └───────────────┘ └───────────────────┘ └────────────────┘
```

- **Backend**: Java 17, Spring Boot 3.2.0, Spring Security, Spring Data JPA, HikariCP.
- **Frontend**: React 18, Vite 5, TypeScript, Tailwind CSS, Lucide Icons.
- **Database & Auth**: Supabase PostgreSQL Cloud, Supabase Auth (JWT Validation).
- **Containerization**: Docker, Docker Compose (`docker-compose.yml` & `docker-compose.prod.yml`), Nginx Alpine.

---

## ⚙️ Cấu Hình Môi Trường (.env)

### 1. File `.env` ở thư mục gốc (Backend)
Sao chép từ `.env.example`:
```env
# AI Provider Keys
GROQ_API_KEY=gsk_your_groq_key
GROQ_MODEL=llama-3.3-70b-versatile

GEMINI_API_KEY=your_gemini_key
GEMINI_BASE_URL=https://generativelanguage.googleapis.com
GEMINI_MODEL=gemini-1.5-flash

# Supabase Database Configuration
DB_URL=jdbc:postgresql://aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
DB_USERNAME=postgres.your_project_ref
DB_PASSWORD=your_db_password

# Supabase Auth Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

SPRING_PROFILES_ACTIVE=prod
```

### 2. File `frontend/.env.local` (Frontend)
Sao chép từ `frontend/.env.example`:
```env
VITE_API_URL=http://localhost:8080/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚀 Hướng Dẫn Khởi Chạy Dự Án

### Cách 1: Sử dụng Docker Compose (Khuyên dùng - 1 Lệnh duy nhất)
```powershell
docker compose up -d
```
- **Giao diện Frontend**: `http://localhost:5173` (Tự động hot-reload khi sửa code)
- **Backend API**: `http://localhost:8080/api`

*Tắt hệ thống container:*
```powershell
docker compose down
```

---

### Cách 2: Khởi chạy Thủ công (Local Terminal)

#### 1. Khởi chạy Backend (Spring Boot)
```powershell
# Windows
./mvnw.cmd spring-boot:run

# macOS / Linux
./mvnw spring-boot:run
```

#### 2. Khởi chạy Frontend (React + Vite)
Mở cửa sổ Terminal mới:
```powershell
cd frontend
npm install
npm run dev
```

---

## 🐳 Triển Khai Production (Deployment)

### 1. Triển khai bằng Docker Compose (VPS / Server riêng)
```powershell
docker compose -f docker-compose.prod.yml up -d --build
```
Hệ thống sẽ tự động đóng gói Nginx tối ưu cho Frontend (Port 80) và Spring Boot cho Backend (Port 8080).

### 2. Triển khai Tách biệt (Vercel + Render)
- **Frontend**: Deploy thư mục `frontend/` lên **Vercel**. Cấu hình biến `VITE_API_URL`.
- **Backend**: Deploy thư mục gốc lên **Render** sử dụng file `Dockerfile` có sẵn.

---

## 📡 Danh Sách APIs Chính

| Phương thức | Đường dẫn | Mô tả |
| --- | --- | --- |
| `GET` | `/api/lessons?level=N5` | Lấy danh sách bài học kèm % hoàn thành |
| `GET` | `/api/lessons/{id}/exercises` | Sinh bài tập tương tác (Flashcard & Quiz) |
| `POST` | `/api/lessons/{id}/complete` | Nộp bài học, ghi nhận `quiz_session` và cộng XP/Streak |
| `GET` | `/api/vocabulary?level=N5` | Tìm kiếm từ vựng phân trang |
| `GET` | `/api/kanji?level=N5` | Tìm kiếm chữ Hán Kanji |
| `GET` | `/api/grammar?level=N5` | Danh sách mẫu ngữ pháp |
| `POST` | `/api/progress/mark` | Đánh giá trạng thái từ vựng (`MASTERED`/`LEARNING`) |
| `POST` | `/api/ai/chat` | Gửi tin nhắn cho Gia sư AI Sensei |
| `GET` | `/api/users/me` | Lấy thông tin & thống kê học viên hiện tại |

---

## 🔒 Kiểm Tra Bảo Mật & An Toàn Code

- **Không chứa dữ liệu nhạy cảm (No Hardcoded Secrets)**: Toàn bộ API Key, Mật khẩu Database và Secret JWT được quản lý qua biến môi trường `.env`.
- **Quản lý Git sạch sẽ (.gitignore)**: File `.env`, `node_modules/`, `target/`, `dist/`, logs và các file làm việc trung gian của AI được ẩn hoàn toàn khỏi Git repository.

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Phát triển phục vụ cộng đồng học tiếng Nhật JLPT.
