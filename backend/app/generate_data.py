"""Sinh du lieu mau 1000+ quan an tren toan quoc Viet Nam."""

import sys
import os
import random
import math

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal, engine, Base
from app.models.place import Place

Base.metadata.create_all(bind=engine)

# ====== CÁC THÀNH PHỐ LỚN Ở VIỆT NAM ======
CITIES = [
    {"ten": "Hà Nội", "tinh": "Hà Nội", "lat_min": 20.97, "lat_max": 21.13, "lng_min": 105.76, "lng_max": 105.92, "districts": ["Hoàn Kiếm", "Ba Đình", "Đống Đa", "Hai Bà Trưng", "Cầu Giấy", "Thanh Xuân", "Hoàng Mai", "Long Biên", "Tây Hồ", "Nam Từ Liêm", "Bắc Từ Liêm", "Hà Đông"]},
    {"ten": "TP.HCM", "tinh": "TP. Hồ Chí Minh", "lat_min": 10.72, "lat_max": 10.85, "lng_min": 106.62, "lng_max": 106.78, "districts": ["Quận 1", "Quận 3", "Quận 5", "Quận 7", "Quận 10", "Tân Bình", "Bình Thạnh", "Phú Nhuận", "Gò Vấp", "Thủ Đức"]},
    {"ten": "Đà Nẵng", "tinh": "Đà Nẵng", "lat_min": 16.02, "lat_max": 16.10, "lng_min": 108.18, "lng_max": 108.27, "districts": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn", "Liên Chiểu", "Cẩm Lệ"]},
    {"ten": "Hải Phòng", "tinh": "Hải Phòng", "lat_min": 20.82, "lat_max": 20.88, "lng_min": 106.65, "lng_max": 106.73, "districts": ["Hồng Bàng", "Lê Chân", "Ngô Quyền", "Kiến An", "Hải An", "Đồ Sơn", "Dương Kinh"]},
    {"ten": "Cần Thơ", "tinh": "Cần Thơ", "lat_min": 10.00, "lat_max": 10.08, "lng_min": 105.72, "lng_max": 105.82, "districts": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn", "Thốt Nốt"]},
    {"ten": "Huế", "tinh": "Huế", "lat_min": 16.42, "lat_max": 16.50, "lng_min": 107.54, "lng_max": 107.64, "districts": ["Thuận Hóa", "Phú Xuân", "Hương Thủy", "Hương Trà"]},
    {"ten": "Đà Lạt", "tinh": "Lâm Đồng", "lat_min": 11.92, "lat_max": 11.98, "lng_min": 108.40, "lng_max": 108.48, "districts": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8"]},
    {"ten": "Nha Trang", "tinh": "Khánh Hòa", "lat_min": 12.22, "lat_max": 12.28, "lng_min": 109.17, "lng_max": 109.23, "districts": ["Vĩnh Hải", "Vĩnh Nguyên", "Vĩnh Thọ", "Xương Huân", "Vạn Thạnh", "Phước Hải", "Phước Hòa", "Lộc Thọ"]},
    {"ten": "Vũng Tàu", "tinh": "Bà Rịa – Vũng Tàu", "lat_min": 10.33, "lat_max": 10.40, "lng_min": 107.05, "lng_max": 107.12, "districts": ["Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9"]},
    {"ten": "Hạ Long", "tinh": "Quảng Ninh", "lat_min": 20.93, "lat_max": 21.00, "lng_min": 107.05, "lng_max": 107.15, "districts": ["Hồng Gai", "Bãi Cháy", "Hà Khánh", "Hà Trung", "Hà Phong", "Hà Lầm", "Hà Khẩu"]},
    {"ten": "Biên Hòa", "tinh": "Đồng Nai", "lat_min": 10.92, "lat_max": 10.98, "lng_min": 106.78, "lng_max": 106.86, "districts": ["Trảng Dài", "Tân Phong", "Tân Mai", "Tam Hiệp", "Long Bình", "Hố Nai", "An Bình"]},
    {"ten": "Hội An", "tinh": "Quảng Nam", "lat_min": 15.86, "lat_max": 15.92, "lng_min": 108.30, "lng_max": 108.38, "districts": ["Minh An", "Tân An", "Cẩm Phô", "Cẩm Nam", "Cẩm Châu", "Sơn Phong"]},
    {"ten": "Vinh", "tinh": "Nghệ An", "lat_min": 18.66, "lat_max": 18.72, "lng_min": 105.64, "lng_max": 105.72, "districts": ["Hồng Sơn", "Trung Đô", "Hưng Bình", "Hưng Dũng", "Quán Bàu", "Lê Lợi", "Đội Cung"]},
    {"ten": "Quy Nhơn", "tinh": "Bình Định", "lat_min": 13.74, "lat_max": 13.80, "lng_min": 109.19, "lng_max": 109.26, "districts": ["Nhơn Bình", "Nhơn Phú", "Lê Hồng Phong", "Trần Phú", "Hải Cảng", "Nguyễn Văn Cừ"]},
    {"ten": "Buôn Ma Thuột", "tinh": "Đắk Lắk", "lat_min": 12.64, "lat_max": 12.72, "lng_min": 108.02, "lng_max": 108.10, "districts": ["Tự An", "Tân Lập", "Tân Tiến", "Tân Hòa", "Thành Nhất", "Thành Công", "Ea Tam"]},
]

# ====== DANH MỤC MÓN ĂN ======
CATEGORIES = [
    {"ten": "Phở", "prefixes": ["Phở", "Phở bò", "Phở gà", "Phở cuốn"], "suffixes": ["Hà Nội", "Cổ điển", "Truyền thống", "Đặc biệt", "Gia truyền", "Số 1", "Bờ Hồ", "Thìn", "Lý Quốc Sư", "Hàng Bồ"]},
    {"ten": "Bún", "prefixes": ["Bún bò", "Bún chả", "Bún đậu", "Bún riêu", "Bún mọc", "Bún thang", "Bún cá"], "suffixes": ["Huế", "Hà Nội", "Đặc biệt", "Mẹt", "Cô Hoa", "Bà Tuyết", "Gia truyền"]},
    {"ten": "Bánh mì", "prefixes": ["Bánh mì", "Bánh mì que", "Bánh mì ốp la"], "suffixes": ["Phượng", "Như Lan", "Hội An", "Chảo", "Ngon", "Bà Tuyết", "Khách", "Sài Gòn", "Đặc biệt"]},
    {"ten": "Cơm", "prefixes": ["Cơm tấm", "Cơm niêu", "Cơm gà", "Cơm rang", "Cơm bụi"], "suffixes": ["Sài Gòn", "Bình Dân", "Văn Phòng", "Đặc biệt", "Ngon", "Bà Nội", "Cô Ba", "Chú Tư"]},
    {"ten": "Hải sản", "prefixes": ["Hải sản", "Ốc", "Lẩu hải sản"], "suffixes": ["Biển", "Cây Thông", "Nha Trang", "Đại Dương", "Tươi Sống", "Bè", "Đêm"]},
    {"ten": "Cà phê", "prefixes": ["Cà phê", "Cafe"], "suffixes": ["Trung Nguyên", "Highlands", "Phố Cổ", "Vườn", "Sân Vườn", "Nhà", "Sách", "Cộng", "Giáy"]},
    {"ten": "Chè", "prefixes": ["Chè", "Chè khúc bạch", "Sữa chua"], "suffixes": ["Thái", "Mẹt", "Cô Huệ", "Bà Ba", "Truyền thống", "Đặc biệt"]},
    {"ten": "Lẩu", "prefixes": ["Lẩu", "Lẩu Thái", "Lẩu bò", "Lẩu gà", "Lẩu ếch"], "suffixes": ["Mama", "Xanh", "Ngon", "Đặc biệt", "Chua cay", "Bò nhúng dấm"]},
    {"ten": "Bánh xèo", "prefixes": ["Bánh xèo", "Bánh căn", "Bánh khọt"], "suffixes": ["Mười Xiềm", "Cô Tư", "Vũng Tàu", "Đặc biệt", "Nghệ An", "Cô Ba"]},
]

# ====== STREETS VIETNAM ======
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

# ====== IMAGES ======
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
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=70",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",
]

# ====== PHONE PREFIXES ======
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
    else:
        return "Tạm đóng"


def generate_places(total=1500):
    db = SessionLocal()
    existing_count = db.query(Place).count()
    if existing_count > 200:
        print(f"Database da co {existing_count} quan. Ban muon them tiep hay xoa het de tao lai?")
        print("Dang them tiep de khong mat du lieu cu...")

    count = 0
    batch = []

    for i in range(total):
        city = random.choice(CITIES)
        cat = random.choice(CATEGORIES)

        lat = random.uniform(city["lat_min"], city["lat_max"])
        lng = random.uniform(city["lng_min"], city["lng_max"])

        prefix = random.choice(cat["prefixes"])
        suffix = f"{random.choice(cat['suffixes'])} {random.choice(['', '', '', 'Q', 'P', 'Cơ sở', 'Chi nhánh'])}{random.randint(1, 9)}".strip()
        if random.random() < 0.15:
            suffix = f"{random.choice(cat['suffixes'])} {random.choice(STREETS).split()[0]}"
        street_num = random.randint(1, 300)
        name = f"{prefix} {suffix}"

        if random.random() < 0.3:
            street = random.choice(STREETS)
            district = random.choice(city["districts"])
            address = f"{street_num} {street}, {district}, {city['ten']}"
        else:
            address = f"{street_num} {random.choice(STREETS)}, {city['ten']}"

        rating_score = random_rating()
        review_count = random.randint(20, 5000)
        danhgia_text = f"{rating_score} ({review_count:,} đánh giá)"
        danhgia_text = danhgia_text.replace(",", ".")

        hours = f"{random.randint(5, 8):02d}:00 – {random.randint(21, 23):02d}:00"

        place = {
            "ten": name,
            "phanloai": cat["ten"],
            "trangthai": random_status(),
            "huyhieu": cat["ten"],
            "vido": round(lat, 6),
            "kinhdo": round(lng, 6),
            "danhgia": danhgia_text,
            "diemdanhgia": rating_score,
            "luotdanhgia": f"{review_count:,} đánh giá",
            "khoangcach": None,
            "gia": random_price(cat["ten"]),
            "khunggia": None,
            "giomocua": hours,
            "giohoatdong": None,
            "hinh": random.choice(FOOD_IMAGES),
            "danhsachhinh": None,
            "diachi": address,
            "tinh": city["tinh"],
            "dienthoai": random_phone(),
            "mota": None,
            "monan": cat["ten"],
            "tienich": "an_uong",
            "ladulieu": True,
            "noibat": random.random() < 0.1,
        }

        existing = db.query(Place).filter(Place.ten == name).first()
        if existing:
            continue

        batch.append(place)
        count += 1

        if len(batch) >= 100:
            try:
                db.bulk_insert_mappings(Place, batch)
                db.commit()
                print(f"  Da them {count}/{total}...")
                batch = []
            except Exception as e:
                db.rollback()
                print(f"  Loi: {e}")
                batch = []

    if batch:
        try:
            db.bulk_insert_mappings(Place, batch)
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"  Loi: {e}")

    db.close()
    print(f"\nHoan tat! Da them {count} quan an moi.")
    print(f"Tong so quan trong database: {existing_count + count}")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Sinh du lieu mau quan an")
    parser.add_argument("--total", type=int, default=1500, help="So luong quan an muon tao (mac dinh: 1500)")
    args = parser.parse_args()
    generate_places(args.total)
