-- =============================================
-- FoodMap Vietnam - Migration: thêm cột tinh
-- Chạy trong Supabase SQL Editor
-- =============================================

-- 1) Thêm cột tinh (an toàn: bỏ qua nếu đã tồn tại)
ALTER TABLE places ADD COLUMN IF NOT EXISTS tinh VARCHAR(100);

-- 2) Index cho việc lọc theo tỉnh
CREATE INDEX IF NOT EXISTS idx_places_tinh ON places(tinh);

-- 3) Gán tinh cho dữ liệu sẵn có dựa trên địa chỉ (diachi)
--    (chỉ chạy trên các dòng còn NULL; có thể điều chỉnh keyword theo data thật)
UPDATE places SET tinh = 'Hà Nội'
WHERE tinh IS NULL
  AND (diachi ILIKE '%Hà Nội%' OR diachi ILIKE '%Hanoi%' OR diachi ILIKE '%Hoàn Kiếm%' OR diachi ILIKE '%Hàng Bồ%' OR diachi ILIKE '%Đinh Tiên Hoàng%');

UPDATE places SET tinh = 'Quảng Nam'
WHERE tinh IS NULL
  AND (diachi ILIKE '%Quảng Nam%' OR diachi ILIKE '%Hội An%' OR diachi ILIKE '%Phan Chu Trinh%' OR diachi ILIKE '%Trần Phú, Hội An%');

UPDATE places SET tinh = 'Huế'
WHERE tinh IS NULL
  AND (diachi ILIKE '%Huế%' OR diachi ILIKE '%Thừa Thiên%' OR diachi ILIKE '%Nguyễn Huệ, Huế%');

UPDATE places SET tinh = 'TP. Hồ Chí Minh'
WHERE tinh IS NULL
  AND (diachi ILIKE '%TP.HCM%' OR diachi ILIKE '%TP. HCM%' OR diachi ILIKE '%Sài Gòn%' OR diachi ILIKE '%Quận 1%' OR diachi ILIKE '%Quận 3%' OR diachi ILIKE '%Trần Quốc Toản%' OR diachi ILIKE '%Tân Bình%' OR diachi ILIKE '%Gò Vấp%' OR diachi ILIKE '%Bình Thạnh%' OR diachi ILIKE '%Thủ Đức%');

-- Đồng Tháp (dùng khi có dữ liệu ở Đồng Tháp)
UPDATE places SET tinh = 'Đồng Tháp'
WHERE tinh IS NULL
  AND (diachi ILIKE '%Đồng Tháp%' OR diachi ILIKE '%Cao Lãnh%' OR diachi ILIKE '%Sa Đéc%' OR diachi ILIKE '%Lai Vung%' OR diachi ILIKE '%Hồng Ngự%' OR diachi ILIKE '%Châu Thành, Đồng Tháp%');

-- 4) XEM KẾT QUẢ: các dòng vẫn còn tinh = NULL cần xử lý thủ công
SELECT id, ten, diachi, tinh FROM places WHERE tinh IS NULL ORDER BY id;
