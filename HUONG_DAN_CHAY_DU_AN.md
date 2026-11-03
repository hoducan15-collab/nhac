# 🎵 HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY HỆ THỐNG MUSICSTUDIO PRO

Tài liệu hướng dẫn chi tiết cách khởi chạy toàn bộ nền tảng **MusicStudio Pro** (AI Music Generation Suite) gồm **Frontend (Next.js)**, **Backend (ASP.NET Core .NET 10)**, **Database (PostgreSQL)** và **Audio Engine (Python PyWorld & Demucs)**.

---

## 📌 MỤC LỤC
1. [Yêu cầu hệ thống (Prerequisites)](#1-yêu-cầu-hệ-thống-prerequisites)
2. [CÁCH 1: Khởi chạy toàn bộ bằng Docker (Khuyên dùng)](#2-cách-1-khởi-chạy-toàn-bộ-bằng-docker-khuyên-dùng)
3. [CÁCH 2: Khởi chạy thủ công từng phần (Dành cho Lập trình viên)](#3-cách-2-khởi-chạy-thủ-công-từng-phần-dành-cho-lập-trình-viên)
4. [Hướng dẫn Build lại Docker Image khi sửa Code](#4-hướng-dẫn-build-lại-docker-image-khi-sửa-code)
5. [Thông tin Đăng nhập & Tài khoản Demo](#5-thông-tin-đăng-nhập--tài-khoản-demo)
6. [Các Cổng Dịch Vụ & Endpoints](#6-các-cổng-dịch-vụ--endpoints)
7. [Xử lý lỗi thường gặp (Troubleshooting)](#7-xử-lý-lỗi-thường-gặp-troubleshooting)

---

## 1. Yêu cầu hệ thống (Prerequisites)

Tùy theo cách bạn chọn khởi chạy:

- **Nếu chạy bằng Docker (Đơn giản nhất, không cần cài .NET hay Python):**
  - Đã cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS / Windows / Linux).
  - Tối thiểu 4GB RAM trống và 10GB dung lượng ổ cứng.
- **Nếu chạy thủ công (Development Mode):**
  - **.NET 10 SDK** (hoặc .NET 9).
  - **Node.js** (v18 trở lên, khuyến nghị v20 LTS) và `npm`.
  - **Python 3.10 – 3.12** kèm `pip`.
  - **PostgreSQL 16** (hoặc chạy Postgres qua Docker).

---

## 2. CÁCH 1: Khởi chạy toàn bộ bằng Docker (Khuyên dùng)

Đây là cách nhanh nhất và ổn định nhất, toàn bộ môi trường từ cơ sở dữ liệu PostgreSQL, Backend API cùng AI Audio Engine (PyWorld, Torch, Soundfile) và Frontend Next.js đều được đóng gói tự động.

### Bước 1: Mở Terminal tại thư mục gốc của dự án
```bash
cd /Users/chaudamvan/nhac
```

### Bước 2: Khởi chạy hệ thống bằng Docker Compose
```bash
# Build và chạy ngầm (Detached mode)
docker compose up -d --build
```

### Bước 3: Kiểm tra trạng thái các Container
```bash
docker compose ps
```
Kết quả hiển thị 3 container đều ở trạng thái `Up`:
- `musicstudio_postgres`: Cổng `5432`
- `musicstudio_backend`: Cổng `5050`
- `musicstudio_frontend`: Cổng `3000`

### Bước 4: Xem Logs của hệ thống (nếu cần theo dõi)
```bash
# Xem log toàn bộ hệ thống
docker compose logs -f

# Xem riêng log Backend
docker compose logs -f backend

# Xem riêng log Frontend
docker compose logs -f frontend
```

### Bước 5: Dừng hệ thống khi không sử dụng
```bash
docker compose down
```

---

## 3. CÁCH 2: Khởi chạy thủ công từng phần (Dành cho Lập trình viên)

Dành cho khi bạn muốn vừa code vừa reload trực tiếp (Hot Reload) trên máy host.

### Bước 3.1: Khởi chạy Database PostgreSQL
Nếu bạn không cài PostgreSQL trực tiếp trên máy, hãy bật riêng container Postgres:
```bash
docker compose up -d postgres
```
Thông tin kết nối:
- Host: `localhost`
- Port: `5432`
- Database: `musicstudiodb`
- User: `postgres`
- Password: `postgres`

### Bước 3.2: Chuẩn bị môi trường Python cho AI Audio Engine
Backend sử dụng các script Python để tách nhạc và chuyển đổi giọng hát:
```bash
# Cài đặt các thư viện cần thiết cho Audio Engine
pip3 install "setuptools>=68,<81" wheel numpy scipy torch torchaudio soundfile pyworld
```
> **Lưu ý quan trọng**: Bắt buộc cài đặt `setuptools<81` để tránh lỗi `ModuleNotFoundError: No module named 'pkg_resources'` của PyWorld.

### Bước 3.3: Khởi chạy Backend ASP.NET Core API (.NET 10)
```bash
cd backend/src/MusicStudio.API

# Khôi phục dependencies và chạy API
dotnet run
```
- API Backend sẽ hoạt động tại: `http://localhost:5000` (hoặc `http://localhost:5050` tùy cấu hình `launchSettings.json`).
- Tài liệu OpenAPI: `http://localhost:5000/openapi/v1.json`

### Bước 3.4: Khởi chạy Frontend Next.js
Mở một cửa sổ Terminal mới:
```bash
cd frontend

# Cài đặt node_modules (chỉ chạy lần đầu)
npm install

# Khởi chạy server phát triển
npm run dev
```
- Giao diện web mở tại: `http://localhost:3000`

---

## 4. Hướng dẫn Build lại Docker Image khi sửa Code

Mỗi khi bạn có chỉnh sửa lớn trong source code và muốn cập nhật vào Docker:

### Cách 1: Rebuild tự động qua Docker Compose
```bash
# Rebuild toàn bộ
docker compose build --no-cache
docker compose up -d

# Hoặc chỉ rebuild riêng backend
docker compose build backend
docker compose up -d backend

# Hoặc chỉ rebuild riêng frontend
docker compose build frontend
docker compose up -d frontend
```

### Cách 2: Deploy nhanh code Backend vào Container đang chạy (Hot Deploy)
Nếu bạn chỉ sửa code C# backend và muốn cập nhật ngay mà không cần đợi Docker rebuild lại các thư viện Python:
```bash
# 1. Biên dịch Release ở máy host
DOTNET_CLI_HOME=/tmp dotnet publish backend/src/MusicStudio.API/MusicStudio.API.csproj -c Release -o /tmp/publish_backend

# 2. Copy trực tiếp vào container
docker cp /tmp/publish_backend/. musicstudio_backend:/app/

# 3. Khởi động lại container backend
docker restart musicstudio_backend
```

---

## 5. Thông tin Đăng nhập & Tài khoản Demo

Hệ thống đã tự động khởi tạo sẵn các tài khoản thử nghiệm:

| Tài khoản | Email | Mật khẩu | Quyền hạn | Số Credits |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@musicstudio.ai` | `Admin@123456` | Admin | 9,999 Credits |
| **Người dùng Demo (User)**| `demo@musicstudio.ai`  | `Demo@123456`  | User  | 500 Credits |

> Ngoài ra bạn có thể bấm **Đăng ký tài khoản mới** ngay trên giao diện web, tài khoản mới sẽ được tự động tặng 50 Credits khởi đầu.

---

## 6. Các Cổng Dịch Vụ & Endpoints

| Dịch vụ | Địa chỉ URL | Ghi chú |
| :--- | :--- | :--- |
| **Web Studio (Giao diện chính)** | [http://localhost:3000](http://localhost:3000) | Next.js 16 App Router |
| **AI Studio (Tạo bài hát)** | [http://localhost:3000/studio](http://localhost:3000/studio) | Sáng tác nhạc & chọn ca sĩ AI |
| **Voice Cloning & SVC** | [http://localhost:3000/voices](http://localhost:3000/voices) | Bóc tách vocal, huấn luyện giọng & đổi giọng hát |
| **Backend REST API** | [http://localhost:5050/api/v1](http://localhost:5050/api/v1) | ASP.NET Core Clean Architecture |
| **Stream Audio / File nhạc** | `http://localhost:5050/api/v1/generations/audio/<file.mp3>` | Phục vụ file nhạc trực tiếp |
| **PostgreSQL Database** | `localhost:5432` | Database `musicstudiodb` |

---

## 7. Xử lý lỗi thường gặp (Troubleshooting)

### 1. Lỗi cổng bị chiếm dụng (Port Conflict: 3000, 5050, 5432)
Nếu gặp lỗi `port is already allocated`:
```bash
# Kiểm tra tiến trình đang chiếm cổng trên macOS/Linux:
lsof -i :3000
lsof -i :5050
lsof -i :5432

# Tắt tiến trình cũ:
kill -9 <PID>
```

### 2. Lỗi `No module named 'pkg_resources'` trong container
Lỗi này do phiên bản `setuptools` mới (>=81) đã gỡ bỏ module `pkg_resources` mà PyWorld yêu cầu.
- **Cách khắc phục**:
  ```bash
  docker exec -it musicstudio_backend python3 -m pip install "setuptools>=68,<81"
  ```
  *(Dockerfile của dự án đã được ghim sẵn phiên bản tương thích này).*

### 3. File audio tạo ra không nghe được (Lỗi 404)
Kiểm tra xem file đã được lưu trong thư mục Storage của Backend chưa:
```bash
docker exec -it musicstudio_backend ls -la /app/Storage/Audio/
```

### 4. Muốn reset lại Database trắng ban đầu
```bash
docker compose down -v
docker compose up -d
```
Lệnh `-v` sẽ xóa sạch volume database cũ và khởi tạo lại database với dữ liệu seed mẫu.

