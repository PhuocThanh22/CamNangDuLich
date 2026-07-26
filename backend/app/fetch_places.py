"""Script lay du lieu quan an tu Google Places API va luu vao database."""

import sys
import os
import requests
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models.place import Place

API_KEY = "AIzaSyCZFINWyVOKoZi0VboTAkZxp_bhR309oi4"

SEARCH_CONFIGS = [
    # (kinhdo, vido, radius_m, keyword)
    (105.854, 21.028, 2000, "phở Hà Nội"),
    (105.854, 21.028, 2000, "bún Hà Nội"),
    (105.854, 21.028, 2000, "bánh mì Hà Nội"),
    (105.854, 21.028, 2000, "cơm Hà Nội"),
    (106.695, 10.778, 2000, "phở Sài Gòn"),
    (106.695, 10.778, 2000, "cơm tấm Sài Gòn"),
    (106.695, 10.778, 2000, "bánh mì Sài Gòn"),
]


def phanloai_from_keyword(keyword):
    default_map = {
        "phở": "Phở",
        "bún": "Bún",
        "bánh mì": "Bánh mì",
        "cơm": "Cơm",
        "cơm tấm": "Cơm",
        "cà phê": "Cà phê",
        "hải sản": "Hải sản",
    }
    kw = keyword.lower()
    for k, v in default_map.items():
        if k in kw:
            return v
    return "Ẩm thực"


def place_type_to_icon(types):
    mapping = {
        "restaurant": "an_uong",
        "cafe": "cafe",
        "bakery": "fast_food",
        "fast_food": "fast_food",
        "bar": "cafe",
    }
    for t in types or []:
        if t in mapping:
            return mapping[t]
    return "an_uong"


def fetch_places_nearby(lat, lng, radius, keyword, api_key, max_results=20):
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": radius,
        "keyword": keyword,
        "language": "vi",
        "key": api_key,
    }

    places = []
    while len(places) < max_results:
        resp = requests.get(url, params=params)
        data = resp.json()

        if data.get("status") != "OK" and data.get("status") != "ZERO_RESULTS":
            print(f"  Loi API: {data.get('status')} - {data.get('error_message', '')}")
            break

        for result in data.get("results", []):
            photo_url = ""
            if result.get("photos"):
                photo_ref = result["photos"][0]["photo_reference"]
                photo_url = (
                    f"https://maps.googleapis.com/maps/api/place/photo"
                    f"?maxwidth=600&photoreference={photo_ref}&key={api_key}"
                )

            rating = result.get("rating", 0)
            user_count = result.get("user_ratings_total", 0)
            danhgia_text = f"{rating}" if rating else ""
            if user_count:
                danhgia_text += f" ({user_count:,} danh gia)"
                danhgia_text = danhgia_text.replace(",", ".")

            price_level = result.get("price_level", 0)
            gia_map = {0: None, 1: "10k–30k đ", 2: "30k–60k đ", 3: "60k–100k đ", 4: "Trên 100k đ"}
            gia_text = gia_map.get(price_level)

            place = {
                "ten": result.get("name", ""),
                "phanloai": phanloai_from_keyword(keyword),
                "trangthai": "Đang mở",
                "vido": result["geometry"]["location"]["lat"],
                "kinhdo": result["geometry"]["location"]["lng"],
                "danhgia": danhgia_text or None,
                "diemdanhgia": rating or 0,
                "luotdanhgia": f"{user_count:,} đánh giá" if user_count else None,
                "gia": gia_text,
                "hinh": photo_url or None,
                "diachi": result.get("vicinity", ""),
                "dienthoai": None,
                "mota": None,
                "monan": phanloai_from_keyword(keyword),
                "tienich": place_type_to_icon(result.get("types", [])),
                "ladulieu": False,
                "noibat": False,
            }
            places.append(place)

        next_token = data.get("next_page_token")
        if next_token and len(places) < max_results:
            params["pagetoken"] = next_token
            time.sleep(2)
        else:
            break

    return places[:max_results]


def fetch_place_details(place_id, api_key):
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "place_id": place_id,
        "fields": "name,formatted_address,international_phone_number,website,opening_hours,editorial_summary",
        "language": "vi",
        "key": api_key,
    }
    resp = requests.get(url, params=params)
    data = resp.json()
    result = data.get("result", {})
    return {
        "dienthoai": result.get("international_phone_number"),
        "diachi": result.get("formatted_address"),
        "trangweb": result.get("website"),
        "giohoatdong": result.get("opening_hours", {}).get("weekday_text"),
        "mota": (result.get("editorial_summary") or {}).get("overview"),
    }


def fetch_all():
    if API_KEY == "YOUR_GOOGLE_MAPS_API_KEY":
        print("=" * 60)
        print("  CAN: Dat API key trong file fetch_places.py")
        print("  1. Vao https://console.cloud.google.com")
        print("  2. Bat 'Places API'")
        print("  3. Tao API key va dat vao bien API_KEY")
        print("=" * 60)
        return

    db = SessionLocal()
    total = 0

    for lng, lat, radius, keyword in SEARCH_CONFIGS:
        print(f"\nDang tim: '{keyword}' tai ({lat}, {lng})...")
        places = fetch_places_nearby(lat, lng, radius, keyword, API_KEY)
        print(f"  Tim thay {len(places)} quan")

        for p in places:
            existing = db.query(Place).filter(Place.ten == p["ten"]).first()
            if existing:
                continue
            place = Place(**p)
            db.add(place)
            total += 1

        if total % 10 == 0 and total > 0:
            db.commit()
            print(f"  Da luu {total} quan...")

    db.commit()
    db.close()
    print(f"\nHoan tat! Da them {total} quan an moi.")


if __name__ == "__main__":
    fetch_all()
