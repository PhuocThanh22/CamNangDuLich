-- =============================================
-- FoodMap Vietnam - Seed Data
-- Chạy SAU khi đã tạo bảng (supabase-schema.sql)
-- =============================================

-- Tạo tài khoản admin và user
INSERT INTO users (ten, email, matkhau, vaitro) VALUES
('Admin', 'admin@foodmap.com', '$2b$12$LJ3m4ys3Lg3YOCwFkQYqGOEfYc.OgJ0KRMqP0F7YCJ0YRG0n0O0q', 'admin'),
('Người dùng', 'user@foodmap.com', '$2b$12$LJ3m4ys3Lg3YOCwFkQYqGOEfYc.OgJ0KRMqP0F7YCJ0YRG0n0O0q', 'user');
-- Lưu ý: mật khẩu trên là hash, đăng nhập bằng "admin123" và "user123"

-- Địa điểm (places)
INSERT INTO places (ten, phanloai, monan, trangthai, danhgia, diemdanhgia, khoangcach, gia, hinh, vido, kinhdo, diachi, giomocua, ladulieu, noibat, huyhieu) VALUES
('Phở Thìn Bờ Hồ', 'Phở', 'Phở', 'Đang mở', '4.8 (1,240 đánh giá)', 4.8, '0.8 km', '50k–100k đ', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80', 21.030, 105.852, '61 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội', '06:00 – 22:00', TRUE, TRUE, 'Phở'),
('Bánh mì Phượng Hội An', 'Bánh mì', 'Bánh mì', 'Đang mở', '4.9 (2,806 đánh giá)', 4.9, '1.2 km', '20k–40k đ', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 15.880, 108.327, '2B Phan Chu Trinh, Hội An, Quảng Nam', '06:30 – 21:00', TRUE, TRUE, 'Bánh mì'),
('Bún bò Huế Bà Thảo', 'Bún', 'Bún', 'Đóng cửa', '4.6 (983 đánh giá)', 4.6, '1.8 km', '40k–70k đ', 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80', 16.463, 107.590, '45 Nguyễn Huệ, Huế', '07:00 – 20:00', TRUE, TRUE, 'Bún'),
('Cơm tấm Bình Dân Sài Gòn', 'Cơm', 'Cơm', 'Đang mở', '4.7 (1,654 đánh giá)', 4.7, '0.5 km', '30k–60k đ', 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', 10.778, 106.695, '78 Trần Quốc Toản, Quận 1, TP.HCM', '06:00 – 23:00', TRUE, TRUE, 'Cơm'),
('Phở Hà Nội Số 1', 'Phở', 'Phở', 'Mở', '4.8 · 1,024 đánh giá', 4.8, '0.3 km', '45k–80k đ', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80', 21.035, 105.849, '123 Hàng Bồ, Hoàn Kiếm, Hà Nội', '06:00 – 22:00', TRUE, FALSE, 'Phở'),
('Bún bò Huế Đặc Biệt', 'Bún', 'Bún', 'Mở', '4.9 · 2,345 đánh giá', 4.9, '1.1 km', '50k–90k đ', 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80', 10.776, 106.701, '45 Nguyễn Huệ, Q.1, TP.HCM', '07:00 – 21:00', TRUE, FALSE, 'Bún'),
('Bánh mì Kim Sơn', 'Bánh mì', 'Bánh mì', 'Đóng', '4.5 · 876 đánh giá', 4.5, '0.7 km', '20k–35k đ', 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&q=80', 15.878, 108.330, '78 Trần Phú, Hội An, Quảng Nam', '06:00 – 20:00', TRUE, FALSE, 'Bánh mì');

-- Đánh giá (reviews)
INSERT INTO reviews (nguoidung_id, diadiem_id, diemdanhgia, noidung) VALUES
(2, 1, 5.0, 'Phở ở đây ngon xuất sắc! Nước dùng đậm đà, thơm mùi quế hồi rất tự nhiên. Thịt bò tươi và mềm. Sẽ quay lại thường xuyên!'),
(2, 1, 4.5, 'Quán phở cổ điển nhưng chất lượng không hề cổ. Phở bò tái lăn siêu ngon, nước dùng trong vắt mà đậm vị lắm. Giá cả hợp lý.'),
(2, 2, 4.0, 'Bánh mì ngon, vỏ giòn, nhân đầy.');

-- Cập nhật điểm đánh giá cho places
UPDATE places SET diemdanhgia = 4.8, danhgia = '4.8 (2 đánh giá)', luotdanhgia = '2 đánh giá' WHERE id = 1;

-- Hình ảnh (place_images)
INSERT INTO place_images (diadiem_id, url, alt) VALUES
(1, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80', 'Bát phở truyền thống'),
(1, 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80', 'Món phở và rau thơm'),
(1, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80', 'Bánh phở và thịt bò'),
(1, 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&q=80', 'Không gian quán'),
(1, 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', 'Món ăn đặc sắc'),
(2, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', 'Bánh mì Phượng Hội An');

-- Thực đơn (menu_items)
INSERT INTO menu_items (diadiem_id, ten, gia, mota, hinh) VALUES
(1, 'Phở bò tái', '50,000 VND', 'Phở bò tái truyền thống với nước dùng đậm đà', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80'),
(1, 'Phở bò chín', '50,000 VND', 'Phở bò chín mềm, nước dùng thanh ngọt', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80'),
(1, 'Phở bò tái lăn', '65,000 VND', 'Thịt bò tái lăn thơm béo, đặc biệt ngon', NULL),
(1, 'Phở gà', '45,000 VND', 'Phở gà thả vườn, thịt chắc ngọt', NULL),
(1, 'Trà đá', '5,000 VND', NULL, NULL),
(1, 'Cà phê đen', '15,000 VND', 'Cà phê đen đậm vị Việt Nam', NULL),
(2, 'Bánh mì thịt nướng', '25,000 VND', 'Bánh mì nóng giòn kẹp thịt nướng thơm lừng', NULL),
(2, 'Bánh mì trứng', '15,000 VND', 'Bánh mì trứng ốp la đơn giản mà ngon', NULL),
(2, 'Bánh mì chả lụa', '20,000 VND', 'Bánh mì với chả lụa tươi ngon', NULL),
(2, 'Bánh mì phô mai', '30,000 VND', 'Bánh mì nướng phô mai béo ngậy', NULL),
(2, 'Nước mía', '10,000 VND', 'Nước mía tươi nguyên chất', NULL),
(3, 'Bún bò Huế đặc biệt', '55,000 VND', 'Bún bò Huế đầy đủ thịt, chả, giò', NULL),
(3, 'Bún bò Huế tái', '45,000 VND', 'Bún bò với thịt bò tái', NULL),
(3, 'Bún bò Huế chín', '45,000 VND', 'Bún bò thịt chín mềm', NULL),
(3, 'Nem rán', '20,000 VND', 'Nem rán giòn rụm', NULL),
(4, 'Cơm tấm sườn', '35,000 VND', 'Cơm tấm sườn nướng thơm lừng', NULL),
(4, 'Cơm tấm sườn bì', '40,000 VND', 'Cơm tấm sườn bì đầy đủ', NULL),
(4, 'Cơm tấm đặc biệt', '50,000 VND', 'Cơm tấm với đầy đủ sườn, bì, chả, trứng', NULL),
(4, 'Canh rau', '5,000 VND', NULL, NULL);
