# Kế hoạch triển khai (Deployment Plan)

## Kiến trúc

```
Cloudflare (domain.com)
    │
    ├── domain.com ──────────► Vercel (Next.js frontend)
    │                              │
    │                              └── NEXT_PUBLIC_API_URL = https://api.domain.com
    │
    ├── api.domain.com ───────► Render (FastAPI backend)
    │                              │
    │                              └── DATABASE_URL = Supabase PostgreSQL
    │
    └── DNS management
```

---

## Bước 1: Supabase — Database

1. Vào https://supabase.com → New project
2. Lưu database password
3. Vào **Project Settings → Database → Connection string** (URI mode)
4. Copy chuỗi, thêm `?sslmode=require` ở cuối
   ```
   postgresql://postgres:xxxx@xxxx.supabase.co:5432/postgres?sslmode=require
   ```
5. Giữ lại để dùng ở Bước 2

---

## Bước 2: Backend — Render (FastAPI)

### 2.1. Chuẩn bị

Tạo file `backend/requirements.txt`:

```
fastapi
uvicorn[standard]
sqlalchemy
psycopg2-binary
python-jose[cryptography]
bcrypt==4.0.1
passlib[bcrypt]
python-dotenv
httpx
aiofiles
python-multipart
```

### 2.2. Sửa CORS trong `backend/app/main.py`

```python
origins = [
    "https://your-frontend.vercel.app",
    "https://your-domain.com",
]
```

### 2.3. Deploy lên Render

1. Push toàn bộ code lên GitHub (cả `backend/` và `frontend/`)
2. Vào https://render.com → **New + → Web Service**
3. Chọn repo GitHub, **Root Directory**: `backend`
4. **Runtime**: Python
5. **Build Command**: `pip install -r requirements.txt`
6. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
7. **Add Environment Variable**:
   - `DATABASE_URL` = chuỗi Supabase từ Bước 1
   - `GOOGLE_CLIENT_ID` = giá trị từ `.env` cũ
   - `GOOGLE_CLIENT_SECRET` = giá trị từ `.env` cũ
   - `GOOGLE_REDIRECT_URI` = `https://your-api.onrender.com/api/auth/google/callback`
   - `FACEBOOK_APP_ID` = giá trị từ `.env` cũ
   - `FACEBOOK_APP_SECRET` = giá trị từ `.env` cũ
   - `FACEBOOK_REDIRECT_URI` = `https://your-api.onrender.com/api/auth/facebook/callback`
   - `SMTP_HOST` = smtp.gmail.com
   - `SMTP_PORT` = 587
   - `SMTP_USER` = ...
   - `SMTP_PASSWORD` = ...
8. Deploy, đợi build xong, copy URL (VD: `https://foodmap-api.onrender.com`)

### 2.4. Seed dữ liệu

Sau khi deploy thành công, chạy seed:

```bash
# Trên Render: vào Shell của web service
cd backend && python -m app.seed
```

Hoặc chạy local với DATABASE_URL trỏ vào Supabase:

```bash
cd backend
$env:DATABASE_URL="postgresql://..."  # PowerShell
python -m app.seed
```

---

## Bước 3: Frontend — Vercel (Next.js)

### 3.1. Sửa `frontend/next.config.js`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

module.exports = nextConfig;
```

### 3.2. Set Environment Variables trên Vercel

Vào Vercel Dashboard → Project → **Environment Variables**:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://foodmap-api.onrender.com` |

(Không cần file `.env.local` trên Vercel — dùng UI để set)

### 3.3. Deploy

1. Vào https://vercel.com → **Add New → Project**
2. Import repo GitHub
3. **Root Directory**: `frontend`
4. **Framework Preset**: Next.js (tự động detect)
5. Thêm `NEXT_PUBLIC_API_URL` vào Environment Variables
6. Deploy
7. Sau khi xong, copy URL (VD: `https://cam-nang-du-lich.vercel.app`)

### 3.4. Cập nhật CORS trên Backend

Quay lại Render, thêm URL frontend vào CORS origins:

```python
origins = [
    "https://cam-nang-du-lich.vercel.app",
    "https://your-domain.com",  # nếu có
]
```

Redeploy backend (Render sẽ tự động rebuild nếu push code mới, hoặc bấm **Manual Deploy**).

---

## Bước 4: Cloudflare — Domain (tuỳ chọn)

1. Mua domain (nếu chưa có) trên Cloudflare hoặc Nhà đăng ký khác
2. Vào Cloudflare Dashboard → **DNS → Add Record**:
   - Loại `CNAME`
   - Tên: `@`
   - Đích: `cname.vercel-dns.com`
   - Proxy: Bật (orange cloud)
3. Thêm record API:
   - Loại `CNAME`
   - Tên: `api`
   - Đích: `your-api.onrender.com`
   - Proxy: Bật
4. Vào Vercel → Project → **Domains** → add `your-domain.com`
5. Vào Render → Dashboard → **Settings → Custom Domain** → add `api.your-domain.com`

---

## Bước 5: Social Login — Cập nhật Redirect URIs

### Google
1. Vào https://console.cloud.google.com → APIs & Services → Credentials
2. Sửa OAuth 2.0 Client IDs → **Authorized redirect URIs**:
   - `https://your-api.onrender.com/api/auth/google/callback`

### Facebook
1. Vào https://developers.facebook.com → App → Facebook Login → Settings
2. Sửa **Valid OAuth Redirect URIs**:
   - `https://your-api.onrender.com/api/auth/facebook/callback`

---

## Kiểm tra sau khi deploy

```bash
# 1. API health check
curl https://your-api.onrender.com/api/health

# 2. Lấy danh sách địa điểm
curl https://your-api.onrender.com/api/places

# 3. Mở frontend trên trình duyệt
https://cam-nang-du-lich.vercel.app
```

---

## Danh sách URL mẫu

| Thành phần | URL |
|------------|-----|
| Frontend | `https://cam-nang-du-lich.vercel.app` |
| API | `https://foodmap-api.onrender.com` |
| Database | Supabase PostgreSQL |
| Domain (nếu có) | `https://your-domain.com` |

---

## Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Fix |
|-----|-------------|-----|
| `CORS error` | Frontend gọi API không đúng origin | Thêm frontend URL vào `origins` trong `main.py` |
| `ECONNREFUSED` | DATABASE_URL sai | Kiểm tra connection string, thêm `?sslmode=require` |
| `Mixed content` | HTTP gọi HTTPS | Đảm bảo tất cả URL đều dùng HTTPS |
| Social login fail | Redirect URI không khớp | Cập nhật Google/FB console với URL Render thật |
| `Module not found` | Thiếu package trong requirements.txt | Kiểm tra và thêm package còn thiếu |
