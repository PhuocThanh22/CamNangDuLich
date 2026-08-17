"""Sinh du lieu ~1000 quan an tren toan quoc Vietnam va them vao bang places.

Cach chay:
    1. Tuy chon: neu .env chua co DATABASE_URL tro Supabase, set truoc khi chay:
       PowerShell:
           $env:DATABASE_URL="postgresql://postgres.XXXX:password@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
       hoac copy vao .env
    2. Chay:
       cd backend
       python -m app.generate_places_vn            # mac dinh 1000 quan
       python -m app.generate_places_vn --total 1000
"""

import sys
import os
import random
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal, engine, Base
from app.models.place import Place

# ====== 63 TỈNH/THÀNH — tâm (lat, lng), bán kính lan tỏa (độ), trọng số ======
PROVINCES = [
    # ── Miền Bắc ──
    {"ten": "Hà Nội", "lat": 21.028, "lng": 105.854, "spread": 0.06, "w": 9.0},
    {"ten": "Hải Phòng", "lat": 20.845, "lng": 106.688, "spread": 0.05, "w": 3.5},
    {"ten": "Quảng Ninh", "lat": 20.955, "lng": 107.085, "spread": 0.06, "w": 3.0},
    {"ten": "Thái Nguyên", "lat": 21.594, "lng": 105.848, "spread": 0.05, "w": 1.4},
    {"ten": "Bắc Ninh", "lat": 21.186, "lng": 106.076, "spread": 0.04, "w": 1.5},
    {"ten": "Hưng Yên", "lat": 20.646, "lng": 106.051, "spread": 0.04, "w": 1.2},
    {"ten": "Hải Dương", "lat": 20.940, "lng": 106.333, "spread": 0.05, "w": 1.4},
    {"ten": "Hà Nam", "lat": 20.545, "lng": 105.913, "spread": 0.04, "w": 1.0},
    {"ten": "Nam Định", "lat": 20.420, "lng": 106.168, "spread": 0.05, "w": 1.4},
    {"ten": "Thái Bình", "lat": 20.446, "lng": 106.338, "spread": 0.04, "w": 1.2},
    {"ten": "Ninh Bình", "lat": 20.250, "lng": 105.975, "spread": 0.05, "w": 1.4},
    {"ten": "Hòa Bình", "lat": 20.817, "lng": 105.338, "spread": 0.05, "w": 1.0},
    {"ten": "Sơn La", "lat": 21.327, "lng": 103.914, "spread": 0.06, "w": 1.0},
    {"ten": "Điện Biên", "lat": 21.386, "lng": 103.017, "spread": 0.06, "w": 0.8},
    {"ten": "Lai Châu", "lat": 22.386, "lng": 103.471, "spread": 0.06, "w": 0.6},
    {"ten": "Lào Cai", "lat": 22.485, "lng": 103.975, "spread": 0.06, "w": 1.2},
    {"ten": "Yên Bái", "lat": 21.703, "lng": 104.875, "spread": 0.05, "w": 0.8},
    {"ten": "Tuyên Quang", "lat": 21.823, "lng": 105.214, "spread": 0.05, "w": 0.8},
    {"ten": "Phú Thọ", "lat": 21.403, "lng": 105.225, "spread": 0.05, "w": 1.2},
    {"ten": "Vĩnh Phúc", "lat": 21.360, "lng": 105.600, "spread": 0.04, "w": 1.2},
    {"ten": "Bắc Giang", "lat": 21.281, "lng": 106.194, "spread": 0.05, "w": 1.2},
    {"ten": "Lạng Sơn", "lat": 21.853, "lng": 106.761, "spread": 0.05, "w": 1.0},
    {"ten": "Cao Bằng", "lat": 22.667, "lng": 106.250, "spread": 0.06, "w": 0.6},
    {"ten": "Hà Giang", "lat": 22.823, "lng": 104.980, "spread": 0.06, "w": 0.8},
    # ── Miền Trung ──
    {"ten": "Thanh Hóa", "lat": 19.807, "lng": 105.776, "spread": 0.06, "w": 2.5},
    {"ten": "Nghệ An", "lat": 18.673, "lng": 105.692, "spread": 0.07, "w": 2.5},
    {"ten": "Hà Tĩnh", "lat": 18.356, "lng": 105.896, "spread": 0.05, "w": 1.2},
    {"ten": "Quảng Bình", "lat": 17.470, "lng": 106.622, "spread": 0.06, "w": 1.2},
    {"ten": "Quảng Trị", "lat": 16.817, "lng": 107.100, "spread": 0.05, "w": 0.8},
    {"ten": "Thừa Thiên Huế", "lat": 16.463, "lng": 107.590, "spread": 0.06, "w": 2.5},
    {"ten": "Quảng Nam", "lat": 15.573, "lng": 108.474, "spread": 0.07, "w": 2.5},
    {"ten": "Đà Nẵng", "lat": 16.054, "lng": 108.202, "spread": 0.05, "w": 4.0},
    {"ten": "Quảng Ngãi", "lat": 15.120, "lng": 108.792, "spread": 0.05, "w": 1.2},
    {"ten": "Bình Định", "lat": 13.776, "lng": 109.223, "spread": 0.06, "w": 2.5},
    {"ten": "Phú Yên", "lat": 13.080, "lng": 109.300, "spread": 0.06, "w": 1.2},
    {"ten": "Khánh Hòa", "lat": 12.238, "lng": 109.190, "spread": 0.06, "w": 3.0},
    {"ten": "Ninh Thuận", "lat": 11.564, "lng": 108.988, "spread": 0.05, "w": 1.0},
    {"ten": "Bình Thuận", "lat": 10.932, "lng": 108.100, "spread": 0.07, "w": 1.8},
    # ── Tây Nguyên ──
    {"ten": "Kon Tum", "lat": 14.354, "lng": 107.999, "spread": 0.05, "w": 0.8},
    {"ten": "Gia Lai", "lat": 13.983, "lng": 108.000, "spread": 0.06, "w": 1.2},
    {"ten": "Đắk Lắk", "lat": 12.680, "lng": 108.040, "spread": 0.06, "w": 2.0},
    {"ten": "Đắk Nông", "lat": 11.990, "lng": 107.700, "spread": 0.05, "w": 0.8},
    {"ten": "Lâm Đồng", "lat": 11.940, "lng": 108.440, "spread": 0.06, "w": 2.5},
    # ── Miền Nam ──
    {"ten": "Bình Dương", "lat": 10.980, "lng": 106.650, "spread": 0.06, "w": 3.0},
    {"ten": "Đồng Nai", "lat": 10.950, "lng": 106.820, "spread": 0.07, "w": 3.0},
    {"ten": "Bà Rịa – Vũng Tàu", "lat": 10.410, "lng": 107.170, "spread": 0.06, "w": 2.5},
    {"ten": "TP. Hồ Chí Minh", "lat": 10.776, "lng": 106.695, "spread": 0.07, "w": 10.0},
    {"ten": "Bình Phước", "lat": 11.530, "lng": 106.880, "spread": 0.06, "w": 0.8},
    {"ten": "Tây Ninh", "lat": 11.310, "lng": 106.100, "spread": 0.05, "w": 1.0},
    {"ten": "Long An", "lat": 10.540, "lng": 106.400, "spread": 0.06, "w": 1.2},
    {"ten": "Tiền Giang", "lat": 10.360, "lng": 106.360, "spread": 0.05, "w": 1.5},
    {"ten": "Bến Tre", "lat": 10.240, "lng": 106.380, "spread": 0.05, "w": 1.2},
    {"ten": "Vĩnh Long", "lat": 10.250, "lng": 105.960, "spread": 0.04, "w": 1.0},
    {"ten": "Trà Vinh", "lat": 9.930, "lng": 106.350, "spread": 0.05, "w": 0.8},
    {"ten": "Đồng Tháp", "lat": 10.460, "lng": 105.630, "spread": 0.06, "w": 1.2},
    {"ten": "An Giang", "lat": 10.380, "lng": 105.420, "spread": 0.06, "w": 1.5},
    {"ten": "Kiên Giang", "lat": 10.010, "lng": 105.080, "spread": 0.07, "w": 1.8},
    {"ten": "Cần Thơ", "lat": 10.030, "lng": 105.780, "spread": 0.05, "w": 3.0},
    {"ten": "Hậu Giang", "lat": 9.780, "lng": 105.470, "spread": 0.04, "w": 0.8},
    {"ten": "Sóc Trăng", "lat": 9.600, "lng": 105.970, "spread": 0.05, "w": 1.0},
    {"ten": "Bạc Liêu", "lat": 9.280, "lng": 105.720, "spread": 0.05, "w": 0.8},
    {"ten": "Cà Mau", "lat": 9.180, "lng": 105.150, "spread": 0.05, "w": 1.0},
]

# ====== DANH MỤC MÓN ĂN (theo đặc sản vùng) ======
CATEGORIES = [
    {"ten": "Phở", "prefixes": ["Phở", "Phở bò", "Phở gà"], "suffixes": ["Hà Nội", "Gia truyền", "Cổ điển", "Đặc biệt", "Bờ Hồ", "Số 1", "Thìn", "Lý Quốc Sư"]},
    {"ten": "Bún", "prefixes": ["Bún bò", "Bún chả", "Bún đậu", "Bún riêu", "Bún mọc", "Bún thang", "Bún cá"], "suffixes": ["Huế", "Hà Nội", "Đặc biệt", "Mẹt", "Gia truyền", "Cô Hoa", "Bà Tuyết"]},
    {"ten": "Bánh mì", "prefixes": ["Bánh mì", "Bánh mì que", "Bánh mì ốp la"], "suffixes": ["Phượng", "Như Lan", "Hội An", "Chảo", "Đặc biệt", "Sài Gòn", "Bà Tuyết", "Ngon"]},
    {"ten": "Cơm", "prefixes": ["Cơm tấm", "Cơm niêu", "Cơm gà", "Cơm rang", "Cơm bụi"], "suffixes": ["Sài Gòn", "Bình Dân", "Văn Phòng", "Đặc biệt", "Bà Nội", "Cô Ba", "Chú Tư", "Ngon"]},
    {"ten": "Hải sản", "prefixes": ["Hải sản", "Ốc", "Lẩu hải sản"], "suffixes": ["Biển", "Cây Thông", "Nha Trang", "Đại Dương", "Tươi Sống", "Bè", "Đêm"]},
    {"ten": "Cà phê", "prefixes": ["Cà phê", "Cafe"], "suffixes": ["Trung Nguyên", "Highlands", "Phố Cổ", "Vườn", "Sân Vườn", "Sách", "Cộng", "Giáy", "Nhà"]},
    {"ten": "Chè", "prefixes": ["Chè", "Chè khúc bạch", "Sữa chua"], "suffixes": ["Thái", "Mẹt", "Cô Huệ", "Bà Ba", "Truyền thống", "Đặc biệt"]},
    {"ten": "Lẩu", "prefixes": ["Lẩu", "Lẩu Thái", "Lẩu bò", "Lẩu gà", "Lẩu ếch"], "suffixes": ["Mama", "Xanh", "Ngon", "Đặc biệt", "Chua cay", "Bò nhúng dấm"]},
    {"ten": "Bánh xèo", "prefixes": ["Bánh xèo", "Bánh căn", "Bánh khọt"], "suffixes": ["Mười Xiềm", "Cô Tư", "Vũng Tàu", "Đặc biệt", "Nghệ An", "Cô Ba"]},
]

# ====== ĐẶC SẢN VÙNG MIỀN (phanloai, tên món) ======
PROVINCE_SPECIALTIES = {
    "Hà Nội": [("Phở", "Phở bò Hà Nội"), ("Bún", "Bún chả Hà Nội"), ("Bún", "Bún thang Hà Nội"), ("Phở", "Phở cuốn Thanh Trì"), ("Bún", "Bún ốc nguội"), ("Cơm", "Cơm cháy chà bông"), ("Đồ ngọt", "Chè cốm"), ("Cơm", "Bánh tôm Hồ Tây")],
    "Hải Phòng": [("Bún", "Bánh đa cua"), ("Bánh mì", "Bánh mì cay Hải Phòng"), ("Hải sản", "Nem cua bể"), ("Hải sản", "Sam biển"), ("Đồ ngọt", "Chè bánh đa")],
    "Quảng Ninh": [("Hải sản", "Chả mực Hạ Long"), ("Hải sản", "Sá sùng"), ("Hải sản", "Sam biển"), ("Cơm", "Bánh cuốn chả mực"), ("Hải sản", "Ốc móng tay")],
    "Thái Nguyên": [("Bún", "Bún cá Chợ Chu"), ("Cơm", "Xôi trứng kiến"), ("Đồ ngọt", "Bánh gio"), ("Đồ ngọt", "Bánh ngải")],
    "Bắc Ninh": [("Đồ ngọt", "Bánh phu thê"), ("Đồ ngọt", "Bánh tẻ làng Chờ"), ("Hải sản", "Nem làng Bùi"), ("Bún", "Bún riêu cua")],
    "Hưng Yên": [("Đồ ngọt", "Bánh đậu xanh"), ("Cơm", "Chả gà Tiểu Quan"), ("Bún", "Bún đậu mắm tôm")],
    "Hải Dương": [("Đồ ngọt", "Bánh gai Ninh Giang"), ("Đồ ngọt", "Bánh đậu xanh"), ("Bún", "Cháo cá")],
    "Hà Nam": [("Bún", "Bánh đa kê"), ("Cơm", "Cá kho làng Vũ Đại"), ("Bún", "Bánh đúc nóng")],
    "Nam Định": [("Phở", "Phở bò Nam Định"), ("Bún", "Bánh cuốn làng Kênh"), ("Đồ ngọt", "Bánh gai"), ("Bún", "Cháo cá")],
    "Thái Bình": [("Đồ ngọt", "Bánh cáy"), ("Đồ ngọt", "Bánh gai"), ("Hải sản", "Nem chạo"), ("Bánh mì", "Phở chiên phồng")],
    "Ninh Bình": [("Cơm", "Cơm cháy Ninh Bình"), ("Cơm", "Thịt dê núi"), ("Cơm", "Rượu Kim Sơn")],
    "Hòa Bình": [("Cơm", "Cơm lam Hòa Bình"), ("Cơm", "Thịt lợn mán nướng"), ("Hải sản", "Cá suối nướng")],
    "Sơn La": [("Cơm", "Pa pỉnh tộp"), ("Hải sản", "Cá suối nướng"), ("Cơm", "Thịt trâu gác bếp")],
    "Điện Biên": [("Cơm", "Pa pỉnh tộp"), ("Cơm", "Thắng cố"), ("Cơm", "Thịt lợn cắp nách")],
    "Lai Châu": [("Cơm", "Thắng cố"), ("Cơm", "Thịt lợn cắp nách"), ("Cơm", "Cơm lam")],
    "Lào Cai": [("Phở", "Phở Sapa"), ("Cơm", "Thắng cố"), ("Hải sản", "Cá hồi Sapa"), ("Cơm", "Thịt lợn cắp nách")],
    "Yên Bái": [("Cơm", "Thịt lợn Mường nướng"), ("Cơm", "Xôi nếp nương"), ("Cơm", "Bánh chưng đen")],
    "Tuyên Quang": [("Đồ ngọt", "Bánh gai"), ("Cơm", "Gà đen"), ("Cơm", "Măng chua kho")],
    "Phú Thọ": [("Đồ ngọt", "Bánh tai"), ("Cơm", "Thịt chua"), ("Hải sản", "Cá lăng nướng")],
    "Vĩnh Phúc": [("Hải sản", "Cá thính"), ("Cơm", "Gà hồi nướng"), ("Cơm", "Bánh trùng")],
    "Bắc Giang": [("Đồ ngọt", "Vải thiều Lục Ngạn"), ("Cơm", "Bánh đa kê"), ("Đồ ngọt", "Nem chua")],
    "Lạng Sơn": [("Phở", "Phở chua Lạng Sơn"), ("Bún", "Bánh cuốn trứng"), ("Cơm", "Khâu nhục"), ("Cơm", "Vịt quay")],
    "Cao Bằng": [("Bún", "Bánh cuốn trứng"), ("Phở", "Phở chua"), ("Đồ ngọt", "Thạch đen"), ("Cơm", "Khâu nhục")],
    "Hà Giang": [("Cơm", "Thắng cố"), ("Phở", "Phở chua Hà Giang"), ("Bún", "Cháo ấu tẩu")],
    "Thanh Hóa": [("Đồ ngọt", "Nem chua Thanh Hóa"), ("Đồ ngọt", "Bánh gai Tứ Trụ"), ("Đồ ngọt", "Chè lam"), ("Cơm", "Bánh răng bừa")],
    "Nghệ An": [("Bún", "Cháo lươn Vinh"), ("Bún", "Bánh mướt"), ("Cơm", "Nhút Thanh Chương"), ("Cơm", "Chả cá Bình Định")],
    "Hà Tĩnh": [("Đồ ngọt", "Kẹo cu đơ"), ("Bún", "Bánh bột lọc"), ("Bún", "Cháo lươn Hà Tĩnh")],
    "Quảng Bình": [("Bún", "Cháo canh Quảng Bình"), ("Đồ ngọt", "Bánh bèo"), ("Cơm", "Tôm chua")],
    "Quảng Trị": [("Bún", "Bánh bột lọc"), ("Bún", "Cháo bột"), ("Bún", "Bánh khoái")],
    "Thừa Thiên Huế": [("Bún", "Bún bò Huế"), ("Đồ ngọt", "Bánh bèo"), ("Đồ ngọt", "Bánh bột lọc"), ("Bún", "Bánh khoái"), ("Cơm", "Cơm hến"), ("Đồ ngọt", "Chè Huế"), ("Bún", "Bánh nậm")],
    "Quảng Nam": [("Bún", "Mì Quảng"), ("Bún", "Cao lầu Hội An"), ("Đồ ngọt", "Bánh đập"), ("Đồ ngọt", "Chè xoa xoa")],
    "Đà Nẵng": [("Bún", "Mì Quảng"), ("Hải sản", "Bánh tráng cuốn thịt heo"), ("Bún", "Bún chả cá"), ("Hải sản", "Hải sản Đà Nẵng"), ("Bánh mì", "Bánh mì Đà Nẵng")],
    "Quảng Ngãi": [("Đồ ngọt", "Kẹo gương"), ("Đồ ngọt", "Bánh ít lá gai"), ("Cơm", "Cháo bồ câu"), ("Bún", "Bánh xèo")],
    "Bình Định": [("Cơm", "Bánh xèo tôm nhảy"), ("Bún", "Bánh hỏi"), ("Đồ ngọt", "Nem chợ Huyện"), ("Hải sản", "Chả ram bông")],
    "Phú Yên": [("Bún", "Bánh canh cá lóc"), ("Cơm", "Cơm gà Phú Yên"), ("Hải sản", "Mắt cá ngừ đại dương"), ("Hải sản", "Bánh tráng nướng")],
    "Khánh Hòa": [("Bún", "Bún cá Nha Trang"), ("Bún", "Bánh canh Nha Trang"), ("Hải sản", "Nem nướng Nha Trang"), ("Hải sản", "Sò huyết"), ("Hải sản", "Mực nướng")],
    "Ninh Thuận": [("Đồ ngọt", "Bánh căn"), ("Đồ ngọt", "Bánh xèo"), ("Cơm", "Cừu nướng"), ("Hải sản", "Mực khô")],
    "Bình Thuận": [("Đồ ngọt", "Bánh căn"), ("Bánh mì", "Bánh quai vạc"), ("Hải sản", "Lẩu thả"), ("Hải sản", "Nước mắm Phan Thiết")],
    "Kon Tum": [("Cơm", "Cơm lam Kon Tum"), ("Cơm", "Gà nướng cơm lam"), ("Cơm", "Thịt trâu gác bếp"), ("Cơm", "Rượu ghè")],
    "Gia Lai": [("Phở", "Phở khô Gia Lai"), ("Bún", "Bánh canh Gia Lai"), ("Cơm", "Gà nướng cơm lam"), ("Cơm", "Măng le xào")],
    "Đắk Lắk": [("Bún", "Bún đỏ Buôn Ma Thuột"), ("Cà phê", "Cà phê Buôn Ma Thuột"), ("Cơm", "Gà xé phay"), ("Cơm", "Cơm lam")],
    "Đắk Nông": [("Cơm", "Gà xé phay"), ("Cơm", "Cơm lam"), ("Hải sản", "Cá suối nướng")],
    "Lâm Đồng": [("Đồ ngọt", "Bánh căn Đà Lạt"), ("Đồ ngọt", "Bánh ướt lòng gà"), ("Cơm", "Gà bó xôi"), ("Đồ ngọt", "Dâu tây Đà Lạt"), ("Cà phê", "Cà phê Đà Lạt")],
    "Bình Dương": [("Bún", "Bánh bèo"), ("Đồ ngọt", "Bánh bò"), ("Hải sản", "Lẩu bò nhúng mắm"), ("Bún", "Gỏi cuốn")],
    "Đồng Nai": [("Đồ ngọt", "Bánh tráng nướng"), ("Cơm", "Cơm tấm Biên Hòa"), ("Hải sản", "Cá lóc nướng trui"), ("Đồ ngọt", "Bưởi Tân Triều")],
    "Bà Rịa – Vũng Tàu": [("Cơm", "Bánh khọt Vũng Tàu"), ("Hải sản", "Hải sản Vũng Tàu"), ("Hải sản", "Lẩu cá đuối"), ("Hải sản", "Bánh xèo hải sản")],
    "TP. Hồ Chí Minh": [("Cơm", "Cơm tấm Sài Gòn"), ("Bánh mì", "Bánh mì Sài Gòn"), ("Phở", "Phở Sài Gòn"), ("Bún", "Hủ tiếu Sài Gòn"), ("Bún", "Bún riêu cua"), ("Hải sản", "Ốc Sài Gòn"), ("Bún", "Hủ tiếu Nam Vang"), ("Đồ ngọt", "Chè Sài Gòn")],
    "Bình Phước": [("Cơm", "Bánh tráng phơi sương"), ("Cơm", "Thịt heo bản"), ("Đồ ngọt", "Hạt điều rang muối")],
    "Tây Ninh": [("Cơm", "Bánh tráng phơi sương"), ("Bún", "Bánh canh Trảng Bàng"), ("Đồ ngọt", "Muối ớt Tây Ninh")],
    "Long An": [("Đồ ngọt", "Bánh tét"), ("Bún", "Gỏi cuốn"), ("Đồ ngọt", "Dừa Long An")],
    "Tiền Giang": [("Bún", "Hủ tiếu Mỹ Tho"), ("Đồ ngọt", "Bánh phồng tôm"), ("Đồ ngọt", "Chè bưởi")],
    "Bến Tre": [("Hải sản", "Bánh xèo Bến Tre"), ("Đồ ngọt", "Kẹo dừa"), ("Bún", "Gỏi cuốn")],
    "Vĩnh Long": [("Đồ ngọt", "Bánh tét"), ("Bún", "Bún mắm"), ("Hải sản", "Cá lóc nướng trui")],
    "Trà Vinh": [("Đồ ngọt", "Bánh tét"), ("Bún", "Bún nước lèo"), ("Cơm", "Cháo ám")],
    "Đồng Tháp": [("Hải sản", "Cá linh non kho"), ("Đồ ngọt", "Sen Đồng Tháp"), ("Bún", "Hủ tiếu Sa Đéc"), ("Hải sản", "Bánh xèo")],
    "An Giang": [("Bún", "Bún cá Châu Đốc"), ("Bún", "Mắm Châu Đốc"), ("Hải sản", "Lẩu mắm"), ("Đồ ngọt", "Bánh bò thốt nốt")],
    "Kiên Giang": [("Bún", "Bún cá Rạch Giá"), ("Hải sản", "Gỏi cá trích"), ("Hải sản", "Mực tươi Phú Quốc"), ("Cơm", "Bánh xèo")],
    "Cần Thơ": [("Bún", "Bún mắm"), ("Hải sản", "Lẩu mắm"), ("Cơm", "Cháo cá lóc"), ("Bún", "Nem nướng Cần Thơ"), ("Đồ ngọt", "Bánh xèo Cần Thơ")],
    "Hậu Giang": [("Đồ ngọt", "Bánh pía"), ("Bún", "Bún mắm"), ("Bún", "Nem nướng")],
    "Sóc Trăng": [("Đồ ngọt", "Bánh pía"), ("Bún", "Bún gỏi già"), ("Hải sản", "Lẩu bò nhúng mắm")],
    "Bạc Liêu": [("Đồ ngọt", "Bánh pía"), ("Cơm", "Bánh tằm bì"), ("Cơm", "Cơm cháy chà bông"), ("Cơm", "Mắm bò hóc")],
    "Cà Mau": [("Hải sản", "Ba khía răm"), ("Bún", "Mắm tôm"), ("Hải sản", "Cá nục kho"), ("Hải sản", "Tôm càng nướng")],
}

STREETS = [
    "Nguyễn Huệ", "Trần Hưng Đạo", "Lê Lợi", "Lý Thường Kiệt", "Nguyễn Trãi",
    "Hai Bà Trưng", "Phạm Ngũ Lão", "Nguyễn Đình Chiểu", "Võ Văn Tần",
    "Cách Mạng Tháng 8", "Trường Chinh", "Hoàng Văn Thụ", "Điện Biên Phủ",
    "Nam Kỳ Khởi Nghĩa", "Nguyễn Văn Linh", "Phan Đình Phùng", "Lê Duẩn",
    "Quang Trung", "Nguyễn Thái Học", "Hàng Bài", "Hàng Bông", "Hàng Gai",
    "Hàng Đào", "Hàng Mã", "Bà Triệu", "Trần Quốc Toản", "Tôn Đức Thắng",
    "Lý Tự Trọng", "Pasteur", "Nguyễn Thị Minh Khai", "Hàm Nghi",
    "Lê Lai", "Lê Thánh Tôn", "Đồng Khởi", "Mạc Đĩnh Chi", "Trần Quốc Hoàn",
    "Tây Sơn", "Xã Đàn", "Tôn Thất Tùng", "Giải Phóng", "Tạ Quang Bửu",
]

FOOD_IMAGES = [
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=70",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&q=70",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=70",
    "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=70",
    "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=70",
    "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&q=70",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=70",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=70",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",
    "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&q=70",
    "https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&q=70",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70",
    "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=70",
]

PHONE_PREFIXES = ["090", "091", "093", "094", "096", "097", "098", "036", "037", "038", "039", "070", "076", "077", "078", "079", "081", "082", "083", "084", "085", "086", "088", "089"]


def random_phone():
    return f"{random.choice(PHONE_PREFIXES)}{random.randint(1000000, 9999999)}"


def random_price(category):
    if category == "Cà phê":
        return random.choice(["15k–30k đ", "20k–45k đ", "25k–55k đ", "30k–60k đ"])
    elif category == "Bánh mì":
        return random.choice(["10k–25k đ", "15k–35k đ", "20k–40k đ", "25k–50k đ"])
    elif category == "Chè":
        return random.choice(["10k–20k đ", "15k–30k đ", "20k–35k đ"])
    elif category in ("Hải sản", "Lẩu"):
        return random.choice(["50k–150k đ", "80k–200k đ", "100k–300k đ", "150k–500k đ"])
    else:
        return random.choice(["20k–50k đ", "25k–60k đ", "30k–80k đ", "35k–100k đ", "40k–120k đ"])


def random_rating():
    r = random.gauss(4.2, 0.4)
    return round(max(3.0, min(5.0, r)), 1)


def random_status():
    r = random.random()
    if r < 0.75:
        return "Đang mở"
    elif r < 0.9:
        return "Đóng cửa"
    return "Tạm đóng"


def build_place(province, cat):
    lat = province["lat"] + random.uniform(-province["spread"], province["spread"])
    lng = province["lng"] + random.uniform(-province["spread"], province["spread"])

    specialties = PROVINCE_SPECIALTIES.get(province["ten"], [])
    if specialties and random.random() < 0.6:
        cat_ten, dish = random.choice(specialties)
        phanloai = cat_ten
        monan = dish
        prefix, suffix = dish, random.choice(["Gia truyền", "Đặc sản", "Cô Ba", "Bà Tư", "Ngon", "Số 1"])
        if random.random() < 0.25:
            suffix = province["ten"]
        name = f"{prefix} {suffix}"
    else:
        prefix = random.choice(cat["prefixes"])
        suffix = random.choice(cat["suffixes"])
        if random.random() < 0.2:
            suffix = f"{suffix} {random.choice(STREETS).split()[0]}"
        name = f"{prefix} {suffix}"
        phanloai = cat["ten"]
        monan = cat["ten"]

    street_num = random.randint(1, 300)
    street = random.choice(STREETS)
    diachi = f"{street_num} {street}, {province['ten']}"

    rating = random_rating()
    reviews = random.randint(20, 5000)

    hours = f"{random.randint(5, 8):02d}:00 – {random.randint(21, 23):02d}:00"

    return {
        "ten": name,
        "phanloai": phanloai,
        "trangthai": random_status(),
        "huyhieu": phanloai,
        "vido": round(lat, 6),
        "kinhdo": round(lng, 6),
        "danhgia": f"{rating} ({reviews:,} đánh giá)",
        "diemdanhgia": rating,
        "luotdanhgia": f"{reviews:,} đánh giá",
        "khoangcach": None,
        "gia": random_price(phanloai),
        "khunggia": None,
        "giomocua": hours,
        "giohoatdong": None,
        "hinh": random.choice(FOOD_IMAGES),
        "danhsachhinh": None,
        "diachi": diachi,
        "tinh": province["ten"],
        "dienthoai": random_phone(),
        "mota": None,
        "monan": monan,
        "tienich": "an_uong",
        "ladulieu": True,
        "noibat": random.random() < 0.08,
        "daduyet": True,
    }


def plan_per_province(total):
    total_w = sum(p["w"] for p in PROVINCES)
    plan = {}
    assigned = 0
    for i, p in enumerate(PROVINCES):
        n = int(round(total * p["w"] / total_w))
        # đảm bảo mỗi tỉnh ít nhất 1 quán
        n = max(1, n)
        if i == len(PROVINCES) - 1:
            n = total - assigned
        plan[p["ten"]] = n
        assigned += n
    return plan


def generate(total=1000):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        existing_names = {r[0] for r in db.query(Place.ten).all()}
    except Exception as e:
        db.rollback()
        print(f"Loi ket noi database: {e}")
        print("Kiem tra DATABASE_URL (phai tro toi Supabase, them ?sslmode=require).")
        return

    plan = plan_per_province(total)
    print(f"Chuan bi sinh {total} quan an cho {len(PROVINCES)} tinh thanh...")

    batch = []
    added = 0
    skipped = 0

    for province in PROVINCES:
        count_for_prov = plan[province["ten"]]
        made = 0
        guard = 0
        while made < count_for_prov and guard < count_for_prov * 30:
            guard += 1
            cat = random.choice(CATEGORIES)
            place = build_place(province, cat)
            if place["ten"] in existing_names:
                skipped += 1
                continue
            existing_names.add(place["ten"])
            batch.append(place)
            made += 1
            added += 1
            if len(batch) >= 200:
                db.bulk_insert_mappings(Place, batch)
                db.commit()
                batch = []
                print(f"  Da them {added}/{total}...")

    if batch:
        db.bulk_insert_mappings(Place, batch)
        db.commit()

    total_in_db = db.query(Place).count()
    db.close()
    print(f"\nHoan tat! Da them {added} quan an moi (bo qua {skipped} trung ten).")
    print(f"Tong so quan trong bang places: {total_in_db}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sinh du lieu ~1000 quan an toan quoc Viet Nam")
    parser.add_argument("--total", type=int, default=1000, help="So luong quan an muon tao (mac dinh: 1000)")
    args = parser.parse_args()
    generate(args.total)
