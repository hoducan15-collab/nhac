# AI Music Studio — Fullstack Web Application

Nền tảng web hiện đại hỗ trợ sáng tác, hòa âm và sản xuất âm nhạc trực tuyến sử dụng trí tuệ nhân tạo (AI Music Generation Suite).

---

## 1. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript strict mode).
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) với hệ thống màu Dark Mode Studio cao cấp (Coal & Deep Indigo).
- **UI Components & Icons**: [Lucide React](https://lucide.dev/), `@tanstack/react-query`, [Zustand](https://github.com/pmndrs/zustand).
- **Audio Player Engine**: HTML5 Web Audio Player tùy biến, hỗ trợ seeking, volume, streaming & download.

### Backend
- **Core**: C# và **ASP.NET Core Web API** (.NET 10).
- **Kiến trúc**: **Clean Architecture** (API, Application, Domain, Infrastructure, Worker, Tests).
- **Database**: **Entity Framework Core** với **PostgreSQL 16** (`Npgsql.EntityFrameworkCore.PostgreSQL`) và SQLite tự động dự phòng.
- **Validation**: FluentValidation.
- **Bảo mật**: JWT Access Token & Refresh Token rotation có cơ chế thu hồi, Hash SHA-256 có Salt.
- **Provider Abstraction**: `IMusicGenerationProvider` tách biệt logic nghiệp vụ khỏi AI Provider (sẵn sàng tích hợp Suno / Udio / AudioCraft / MusicGen).
- **Kiểm thử**: xUnit Test suite cho Domain, Validators và Business Rules.

---

## 2. CẤU TRÚC DỰ ÁN

```text
nhac/
├── frontend/                          # Next.js 16 App Router (Port 3000)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/              # Landing page, Bảng giá
│   │   │   ├── (auth)/                # Đăng nhập, Đăng ký, Quên mật khẩu
│   │   │   ├── (dashboard)/           # Studio, Dự án, Thư viện, Playlists, Credits, Cài đặt
│   │   │   └── admin/                 # Quản trị Người dùng, Tác vụ AI, Giao dịch
│   │   ├── components/                # Audio Player, Navigation, UI components
│   │   ├── stores/                    # Zustand stores (player, auth)
│   │   ├── lib/                       # API Client, utils, validations
│   │   └── types/                     # TypeScript DTOs & Interfaces
│   └── Dockerfile
│
├── backend/                           # .NET 10 Clean Architecture (Port 5050 -> 5000)
│   ├── Dockerfile
│   ├── MusicStudio.slnx               # Solution file
│   └── src/
│       ├── MusicStudio.Domain/        # Entities, Enums, Value Objects
│       ├── MusicStudio.Application/   # DTOs, Interfaces, Validators
│       ├── MusicStudio.Infrastructure/# EF Core (PostgreSQL), Services, Storage, AI Providers
│       ├── MusicStudio.API/           # Controllers, Swagger, Auth, Program.cs
│       ├── MusicStudio.Worker/        # Background queue worker
│       └── MusicStudio.Tests/         # xUnit Unit tests
│
├── docker-compose.yml                 # PostgreSQL 16 + Backend API + Frontend Next.js
├── .env.example
└── README.md
```

---

## 3. HƯỚNG DẪN KHỞI CHẠY (DOCKER COMPOSE)

Chỉ cần một lệnh duy nhất để build và khởi chạy toàn bộ hệ thống gồm PostgreSQL, Backend .NET 10 và Frontend Next.js:

```bash
docker compose up -d
```

- **Frontend Web App**: `http://localhost:3000`
- **Backend Web API**: `http://localhost:5050`
- **PostgreSQL Database**: `localhost:5432` (`musicstudiodb` / user `postgres` / pass `postgres`)

### Bước 2: Chạy Backend ASP.NET Core API
```bash
cd backend/src/MusicStudio.API
dotnet run
```
- API sẽ lắng nghe tại: `http://localhost:5000` (hoặc cổng cấu hình).
- OpenAPI tài liệu kỹ thuật: `http://localhost:5000/openapi/v1.json`

### Bước 3: Chạy Frontend Next.js
Mở một terminal mới:
```bash
cd frontend
npm run dev
```
- Ứng dụng web mở tại: `http://localhost:3000`

---

## 4. TÀI KHOẢN MẪU & SEED DATA

Hệ thống đã tự động seed dữ liệu mẫu khi khởi động:
- **Tài khoản Quản trị (Admin)**:
  - Email: `admin@musicstudio.ai`
  - Mật khẩu: `Admin@123456`
  - Quyền: `Admin` (9,999 Credits)
- **Tài khoản Người dùng (User)**:
  - Email: `demo@musicstudio.ai`
  - Mật khẩu: `Demo@123456`
  - Quyền: `User` (100 Credits)

---

## 5. DANH SÁCH API ENDPOINTS CHÍNH

### Xác thực & Tài khoản (`/api/v1/auth`)
- `POST /api/v1/auth/register`: Đăng ký tài khoản mới & tặng 50 credits chào mừng.
- `POST /api/v1/auth/login`: Đăng nhập, cấp JWT Access Token và Refresh Token.
- `POST /api/v1/auth/refresh`: Làm mới Access Token an toàn.
- `POST /api/v1/auth/logout`: Thu hồi token.

### Dự án âm nhạc (`/api/v1/music-projects`)
- `GET /api/v1/music-projects`: Lấy danh sách dự án (có tìm kiếm & lọc).
- `POST /api/v1/music-projects`: Tạo dự án mới.
- `GET /api/v1/music-projects/{id}`: Chi tiết dự án và các phiên bản đã tạo.
- `PUT /api/v1/music-projects/{id}`: Cập nhật thông tin dự án.
- `DELETE /api/v1/music-projects/{id}`: Xóa dự án.

### Sáng tác nhạc AI (`/api/v1/generations`)
- `POST /api/v1/generations`: Gửi yêu cầu tạo nhạc, kiểm tra số dư credit, giữ chỗ, gọi AI Provider, xuất phiên bản và quyết toán credit.
- `GET /api/v1/generations/{id}`: Kiểm tra trạng thái tác vụ.
- `GET /api/v1/generations`: Lịch sử các lần tạo.

### Thư viện & Playlist (`/api/v1/library`)
- `GET /api/v1/library`: Danh sách bản nhạc hoàn chỉnh.
- `POST /api/v1/library/favorites/{versionId}`: Đánh dấu yêu thích.
- `DELETE /api/v1/library/favorites/{versionId}`: Bỏ yêu thích.

### Credit & Thanh toán (`/api/v1/credits`, `/api/v1/billing`)
- `GET /api/v1/credits`: Xem số dư credit.
- `GET /api/v1/credits/ledger`: Lịch sử biến động số dư (nạp, trừ, hoàn trả).
- `POST /api/v1/billing/checkout`: Tạo yêu cầu nạp credit và xử lý thanh toán.

### Quản trị viên (`/api/v1/admin`)
- `GET /api/v1/admin/stats`: Số liệu tổng quan (người dùng, số jobs, doanh thu, tỷ lệ lỗi).

---

## 6. KIỂM THỬ (TESTING)

Để chạy bộ kiểm thử tự động của Backend:
```bash
dotnet test backend/src/MusicStudio.Tests/MusicStudio.Tests.csproj
```
Kết quả kiểm thử: **6/6 Tests Passed (100%)** bao gồm:
1. `PasswordHasher_ShouldCorrectlyHashAndVerify`
2. `RegisterValidator_ShouldFail_WhenEmailIsInvalid`
3. `RegisterValidator_ShouldPass_WhenInputsAreValid`
4. `GenerationJobValidator_ShouldEnforceBpmRange`
5. `MockProvider_ShouldReturnSuccessResponse`
6. `UserCreditDeduction_ShouldUpdateBalanceProperly`

Để kiểm thử build production Frontend:
```bash
cd frontend && npm run build
```
Kết quả: **18/18 routes build thành công không có lỗi type-check**.

---

## 7. CHECKLIST HOÀN THÀNH

- [x] **Phase 1**: Kiểm tra project, lập kế hoạch và chuẩn hóa cấu trúc thư mục.
- [x] **Phase 2**: Hoàn thiện Frontend foundation, Design system (Dark mode Coal/Indigo), Audio Player toàn cục, Layouts, Routing.
- [x] **Phase 3**: Hoàn thiện Backend foundation, Clean Architecture, Dependency Injection, EF Core, SqlServer/Sqlite.
- [x] **Phase 4**: Authentication, JWT Access/Refresh tokens, Quản lý hồ sơ người dùng.
- [x] **Phase 5**: Music Projects CRUD, quản lý album và phiên bản nhạc.
- [x] **Phase 6 & 7**: Generation domain, Provider abstraction (`IMusicGenerationProvider`), Mock engine & giữ chỗ/hoàn trả credit an toàn.
- [x] **Phase 8**: Music Library, Playlists, Yêu thích và trình phát nhạc HTML5 có seeking & volume.
- [x] **Phase 9**: Credit Ledger dạng append-only, nạp gói credit, thanh toán mô phỏng.
- [x] **Phase 10**: Admin Dashboard, theo dõi Jobs AI, giám sát lỗi provider và phân quyền.
