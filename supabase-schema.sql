-- =============================================
-- FoodMap Vietnam - Database Schema
-- Chạy trong Supabase SQL Editor
-- =============================================

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  ten VARCHAR(100) NOT NULL,
  email VARCHAR(200) UNIQUE NOT NULL,
  matkhau VARCHAR(200) NOT NULL,
  vaitro VARCHAR(20) DEFAULT 'user',
  avatar TEXT,
  created_at VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Places
CREATE TABLE IF NOT EXISTS places (
  id SERIAL PRIMARY KEY,
  ten VARCHAR(255) NOT NULL,
  phanloai VARCHAR(100),
  trangthai VARCHAR(50) DEFAULT 'Mở',
  huyhieu VARCHAR(100),
  vido DOUBLE PRECISION,
  kinhdo DOUBLE PRECISION,
  danhgia VARCHAR(50),
  diemdanhgia DOUBLE PRECISION DEFAULT 0,
  luotdanhgia VARCHAR(50),
  khoangcach VARCHAR(50),
  gia VARCHAR(100),
  khunggia VARCHAR(100),
  giomocua VARCHAR(100),
  giohoatdong VARCHAR(200),
  hinh TEXT,
  danhsachhinh TEXT,
  diachi TEXT,
  dienthoai VARCHAR(50),
  mota TEXT,
  monan VARCHAR(100),
  tienich VARCHAR(100),
  trangweb VARCHAR(255),
  ladulieu BOOLEAN DEFAULT TRUE,
  noibat BOOLEAN DEFAULT FALSE,
  nguoidung_id INTEGER REFERENCES users(id),
  created_at VARCHAR(50)
);
CREATE INDEX IF NOT EXISTS idx_places_ten ON places(ten);
CREATE INDEX IF NOT EXISTS idx_places_phanloai ON places(phanloai);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  nguoidung_id INTEGER NOT NULL REFERENCES users(id),
  diadiem_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  diemdanhgia DOUBLE PRECISION DEFAULT 5.0,
  noidung TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Favorites
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  nguoidung_id INTEGER NOT NULL REFERENCES users(id),
  diadiem_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  UNIQUE(nguoidung_id, diadiem_id)
);

-- Place Images
CREATE TABLE IF NOT EXISTS place_images (
  id SERIAL PRIMARY KEY,
  diadiem_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id SERIAL PRIMARY KEY,
  diadiem_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  ten VARCHAR(255) NOT NULL,
  gia VARCHAR(100),
  mota TEXT,
  hinh TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =============================================
-- Xong! Các bảng đã được tạo.
-- =============================================
