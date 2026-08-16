"""Seed script to populate database with demo data matching frontend constants."""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal, engine, Base
from app.models.place import Place
from app.models.user import User
from app.models.review import Review
from app.models.place_image import PlaceImage
from app.models.menu_item import MenuItem
from app.routers.auth import hash_password

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

FOOD_IMAGES = [
    "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
    "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80",
    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80",
    "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
    "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80",
    "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&q=80",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=70",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=70",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70",
    "https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&q=70",
]

places_data = [
    # Featured places
    {
        "ten": "Phở Thìn Bờ Hồ",
        "phanloai": "Phở",
        "monan": "Phở",
        "trangthai": "Đang mở",
        "danhgia": "4.8 (1,240 đánh giá)",
        "diemdanhgia": 4.8,
        "khoangcach": "0.8 km",
        "gia": "50k–100k đ",
        "hinh": FOOD_IMAGES[0],
        "vido": 21.030,
        "kinhdo": 105.852,
        "diachi": "61 Đinh Tiên Hoàng, Hoàn Kiếm, Hà Nội",
        "tinh": "Hà Nội",
        "giomocua": "06:00 – 22:00",
        "ladulieu": True,
        "noibat": True,
        "huyhieu": "Phở",
    },
    {
        "ten": "Bánh mì Phượng Hội An",
        "phanloai": "Bánh mì",
        "monan": "Bánh mì",
        "trangthai": "Đang mở",
        "danhgia": "4.9 (2,806 đánh giá)",
        "diemdanhgia": 4.9,
        "khoangcach": "1.2 km",
        "gia": "20k–40k đ",
        "hinh": FOOD_IMAGES[1],
        "vido": 15.880,
        "kinhdo": 108.327,
        "diachi": "2B Phan Chu Trinh, Hội An, Quảng Nam",
        "tinh": "Quảng Nam",
        "giomocua": "06:30 – 21:00",
        "ladulieu": True,
        "noibat": True,
        "huyhieu": "Bánh mì",
    },
    {
        "ten": "Bún bò Huế Bà Thảo",
        "phanloai": "Bún",
        "monan": "Bún",
        "trangthai": "Đóng cửa",
        "danhgia": "4.6 (983 đánh giá)",
        "diemdanhgia": 4.6,
        "khoangcach": "1.8 km",
        "gia": "40k–70k đ",
        "hinh": FOOD_IMAGES[2],
        "vido": 16.463,
        "kinhdo": 107.590,
        "diachi": "45 Nguyễn Huệ, Huế",
        "tinh": "Huế",
        "giomocua": "07:00 – 20:00",
        "ladulieu": True,
        "noibat": True,
        "huyhieu": "Bún",
    },
    {
        "ten": "Cơm tấm Bình Dân Sài Gòn",
        "phanloai": "Cơm",
        "monan": "Cơm",
        "trangthai": "Đang mở",
        "danhgia": "4.7 (1,654 đánh giá)",
        "diemdanhgia": 4.7,
        "khoangcach": "0.5 km",
        "gia": "30k–60k đ",
        "hinh": FOOD_IMAGES[3],
        "vido": 10.778,
        "kinhdo": 106.695,
        "diachi": "78 Trần Quốc Toản, Quận 1, TP.HCM",
        "tinh": "TP. Hồ Chí Minh",
        "giomocua": "06:00 – 23:00",
        "ladulieu": True,
        "noibat": True,
        "huyhieu": "Cơm",
    },
    # Nearby places
    {
        "ten": "Phở Hà Nội Số 1",
        "phanloai": "Phở",
        "monan": "Phở",
        "trangthai": "Mở",
        "huyhieu": "Phở",
        "danhgia": "4.8 · 1,024 đánh giá",
        "diemdanhgia": 4.8,
        "khoangcach": "0.3 km",
        "gia": "45k–80k đ",
        "giomocua": "06:00 – 22:00",
        "diachi": "123 Hàng Bồ, Hoàn Kiếm, Hà Nội",
        "tinh": "Hà Nội",
        "hinh": FOOD_IMAGES[4],
        "vido": 21.035,
        "kinhdo": 105.849,
        "ladulieu": True,
    },
    {
        "ten": "Bún bò Huế Đặc Biệt",
        "phanloai": "Bún",
        "monan": "Bún",
        "trangthai": "Mở",
        "huyhieu": "Bún",
        "danhgia": "4.9 · 2,345 đánh giá",
        "diemdanhgia": 4.9,
        "khoangcach": "1.1 km",
        "gia": "50k–90k đ",
        "giomocua": "07:00 – 21:00",
        "diachi": "45 Nguyễn Huệ, Q.1, TP.HCM",
        "tinh": "TP. Hồ Chí Minh",
        "hinh": FOOD_IMAGES[5],
        "vido": 10.776,
        "kinhdo": 106.701,
        "ladulieu": True,
    },
    {
        "ten": "Bánh mì Kim Sơn",
        "phanloai": "Bánh mì",
        "monan": "Bánh mì",
        "trangthai": "Đóng",
        "huyhieu": "Bánh mì",
        "danhgia": "4.5 · 876 đánh giá",
        "diemdanhgia": 4.5,
        "khoangcach": "0.7 km",
        "gia": "20k–35k đ",
        "giomocua": "06:00 – 20:00",
        "diachi": "78 Trần Phú, Hội An, Quảng Nam",
        "tinh": "Quảng Nam",
        "hinh": FOOD_IMAGES[6],
        "vido": 15.878,
        "kinhdo": 108.330,
        "ladulieu": True,
    },
    # Map markers
    {
        "ten": "Phở Hà Nội",
        "phanloai": "Phở",
        "monan": "Phở",
        "trangthai": "Mở",
        "vido": 21.030,
        "kinhdo": 105.857,
        "danhgia": "4.7",
        "diemdanhgia": 4.7,
        "gia": "30k–120k đ",
        "hinh": FOOD_IMAGES[7],
        "khoangcach": "120 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
    {
        "ten": "Bún bò Huế Minh Thuận",
        "phanloai": "Bún",
        "monan": "Bún",
        "trangthai": "Mở",
        "vido": 21.025,
        "kinhdo": 105.855,
        "danhgia": "4.5",
        "diemdanhgia": 4.5,
        "gia": "30k–120k đ",
        "hinh": FOOD_IMAGES[8],
        "khoangcach": "180 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
    {
        "ten": "Bánh mì Như Lan",
        "phanloai": "Bánh mì",
        "monan": "Bánh mì",
        "trangthai": "Mở",
        "vido": 21.029,
        "kinhdo": 105.850,
        "danhgia": "4.8",
        "diemdanhgia": 4.8,
        "gia": "20k–50k đ",
        "hinh": FOOD_IMAGES[9],
        "khoangcach": "200 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
    {
        "ten": "Cà phê Trung Nguyên",
        "phanloai": "Cà phê",
        "monan": "Cà phê",
        "trangthai": "Mở",
        "vido": 21.027,
        "kinhdo": 105.859,
        "danhgia": "4.3",
        "diemdanhgia": 4.3,
        "gia": "25k–80k đ",
        "hinh": FOOD_IMAGES[10],
        "khoangcach": "250 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
    {
        "ten": "Cơm tấm Sài Gòn",
        "phanloai": "Cơm",
        "monan": "Cơm",
        "trangthai": "Mở",
        "vido": 21.033,
        "kinhdo": 105.852,
        "danhgia": "4.6",
        "diemdanhgia": 4.6,
        "gia": "30k–120k đ",
        "hinh": FOOD_IMAGES[11],
        "khoangcach": "300 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
    {
        "ten": "Bún chả Hương Liên",
        "phanloai": "Bún",
        "monan": "Bún",
        "trangthai": "Mở",
        "vido": 21.024,
        "kinhdo": 105.851,
        "danhgia": "4.4",
        "diemdanhgia": 4.4,
        "gia": "30k–120k đ",
        "hinh": FOOD_IMAGES[0],
        "khoangcach": "350 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
    {
        "ten": "Hải sản Cây Thông",
        "phanloai": "Hải sản",
        "monan": "Hải sản",
        "trangthai": "Mở",
        "vido": 21.034,
        "kinhdo": 105.856,
        "danhgia": "4.5",
        "diemdanhgia": 4.5,
        "gia": "30k–120k đ",
        "hinh": FOOD_IMAGES[1],
        "khoangcach": "400 m",
        "diachi": "Gần vị trí của bạn",
        "tinh": "Hà Nội",
        "ladulieu": True,
    },
]

def seed():
    db = SessionLocal()

    for data in places_data:
        place = Place(**data)
        db.add(place)

    if not db.query(User).filter(User.email == "admin@foodmap.com").first():
        admin = User(
            ten="Admin",
            email="admin@foodmap.com",
            matkhau=hash_password("admin123"),
            vaitro="admin",
        )
        db.add(admin)

    if not db.query(User).filter(User.email == "user@foodmap.com").first():
        user = User(
            ten="Người dùng",
            email="user@foodmap.com",
            matkhau=hash_password("user123"),
            vaitro="user",
        )
        db.add(user)

    all_places = db.query(Place).all()
    demo_user = db.query(User).filter(User.email == "user@foodmap.com").first()
    if demo_user and all_places:
        sample_reviews = [
            Review(nguoidung_id=demo_user.id, diadiem_id=all_places[0].id, diemdanhgia=5.0, noidung="Pho o day ngon xuat sac! Nuoc dung dam da, thom mui quy hoi rat tu nhien. Thit bo tuoi va mem. Se quay lai thuong xuyen!"),
            Review(nguoidung_id=demo_user.id, diadiem_id=all_places[0].id, diemdanhgia=4.5, noidung="Quan pho co dien nhung chat luong khong he co. Pho bo tai lan sieu ngon, nuoc dung trong vat ma dam vi lam. Gia ca hop ly."),
            Review(nguoidung_id=demo_user.id, diadiem_id=all_places[1].id, diemdanhgia=4.0, noidung="Banh mi ngon, vo gion, nhan day."),
        ]
        for r in sample_reviews:
            db.add(r)

        sample_images = [
            PlaceImage(diadiem_id=all_places[0].id, url="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80", alt="Bat pho truyen thong"),
            PlaceImage(diadiem_id=all_places[0].id, url="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80", alt="Mon pho va rau thom"),
            PlaceImage(diadiem_id=all_places[0].id, url="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80", alt="Banh pho va thit bo"),
            PlaceImage(diadiem_id=all_places[0].id, url="https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&q=80", alt="Khong gian quan"),
            PlaceImage(diadiem_id=all_places[0].id, url="https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80", alt="Mon an dac sac"),
            PlaceImage(diadiem_id=all_places[1].id, url="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", alt="Banh mi Phuong Hoi An"),
        ]
        for img in sample_images:
            db.add(img)

        menu_data = {
            all_places[0].id: [
                MenuItem(diadiem_id=all_places[0].id, ten="Phở bò tái", gia="50,000 VND", mota="Phở bò tái truyền thống với nước dùng đậm đà", hinh="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&q=80"),
                MenuItem(diadiem_id=all_places[0].id, ten="Phở bò chín", gia="50,000 VND", mota="Phở bò chín mềm, nước dùng thanh ngọt", hinh="https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80"),
                MenuItem(diadiem_id=all_places[0].id, ten="Phở bò tái lăn", gia="65,000 VND", mota="Thịt bò tái lăn thơm béo, đặc biệt ngon"),
                MenuItem(diadiem_id=all_places[0].id, ten="Phở gà", gia="45,000 VND", mota="Phở gà thả vườn, thịt chắc ngọt"),
                MenuItem(diadiem_id=all_places[0].id, ten="Trà đá", gia="5,000 VND"),
                MenuItem(diadiem_id=all_places[0].id, ten="Cà phê đen", gia="15,000 VND", mota="Cà phê đen đậm vị Việt Nam"),
            ],
            all_places[1].id: [
                MenuItem(diadiem_id=all_places[1].id, ten="Bánh mì thịt nướng", gia="25,000 VND", mota="Bánh mì nóng giòn kẹp thịt nướng thơm lừng"),
                MenuItem(diadiem_id=all_places[1].id, ten="Bánh mì trứng", gia="15,000 VND", mota="Bánh mì trứng ốp la đơn giản mà ngon"),
                MenuItem(diadiem_id=all_places[1].id, ten="Bánh mì chả lụa", gia="20,000 VND", mota="Bánh mì với chả lụa tươi ngon"),
                MenuItem(diadiem_id=all_places[1].id, ten="Bánh mì phô mai", gia="30,000 VND", mota="Bánh mì nướng phô mai béo ngậy"),
                MenuItem(diadiem_id=all_places[1].id, ten="Nước mía", gia="10,000 VND", mota="Nước mía tươi nguyên chất"),
            ],
            all_places[2].id: [
                MenuItem(diadiem_id=all_places[2].id, ten="Bún bò Huế đặc biệt", gia="55,000 VND", mota="Bún bò Huế đầy đủ thịt, chả, giò"),
                MenuItem(diadiem_id=all_places[2].id, ten="Bún bò Huế tái", gia="45,000 VND", mota="Bún bò với thịt bò tái"),
                MenuItem(diadiem_id=all_places[2].id, ten="Bún bò Huế chín", gia="45,000 VND", mota="Bún bò thịt chín mềm"),
                MenuItem(diadiem_id=all_places[2].id, ten="Nem rán", gia="20,000 VND", mota="Nem rán giòn rụm"),
            ],
            all_places[3].id: [
                MenuItem(diadiem_id=all_places[3].id, ten="Cơm tấm sườn", gia="35,000 VND", mota="Cơm tấm sườn nướng thơm lừng"),
                MenuItem(diadiem_id=all_places[3].id, ten="Cơm tấm sườn bì", gia="40,000 VND", mota="Cơm tấm sườn bì đầy đủ"),
                MenuItem(diadiem_id=all_places[3].id, ten="Cơm tấm đặc biệt", gia="50,000 VND", mota="Cơm tấm với đầy đủ sườn, bì, chả, trứng"),
                MenuItem(diadiem_id=all_places[3].id, ten="Canh rau", gia="5,000 VND"),
            ],
        }
        for items in menu_data.values():
            for item in items:
                db.add(item)

        for place in all_places[:3]:
            reviews_count = db.query(Review).filter(Review.diadiem_id == place.id).all()
            if reviews_count:
                avg_score = round(sum(r.diemdanhgia for r in reviews_count) / len(reviews_count), 1)
                place.diemdanhgia = avg_score
                place.danhgia = f"{avg_score} ({len(reviews_count)} danh gia)"
                place.luotdanhgia = f"{len(reviews_count)} danh gia"

    db.commit()
    db.close()
    print(f"Seeded {len(places_data)} places, 2 users, reviews, and images successfully!")


if __name__ == "__main__":
    seed()
