"""Sinh file .sql chua ~1000 quan an toan quoc Viet Nam de chay trong Supabase SQL Editor.

Cach dung:
    cd backend
    python -m app.generate_places_sql --total 1000 --output ../supabase-places-1000.sql
    -> Mo file sinh ra, copy toan bo vao Supabase SQL Editor roi RUN.
"""

import sys
import os
import random
import argparse
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.generate_places_vn import (
    PROVINCES,
    CATEGORIES,
    PROVINCE_SPECIALTIES,
    build_place,
    plan_per_province,
)

COLUMNS = [
    "ten", "phanloai", "trangthai", "huyhieu", "vido", "kinhdo",
    "danhgia", "diemdanhgia", "luotdanhgia", "khoangcach", "gia",
    "khunggia", "giomocua", "giohoatdong", "hinh", "danhsachhinh",
    "diachi", "tinh", "dienthoai", "mota", "monan", "tienich",
    "trangweb", "ladulieu", "noibat", "daduyet", "created_at",
]


def sql_str(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_bool(value):
    return "TRUE" if value else "FALSE"


def sql_value(col, value):
    if col in ("vido", "kinhdo", "diemdanhgia"):
        return "NULL" if value is None else str(value)
    if col in ("ladulieu", "noibat", "daduyet"):
        return sql_bool(value)
    return sql_str(value)


def build_rows(total, seed):
    random.seed(seed)
    plan = plan_per_province(total)
    rows = []
    seen = set()
    for province in PROVINCES:
        count_for_prov = plan[province["ten"]]
        made = 0
        guard = 0
        while made < count_for_prov and guard < count_for_prov * 30:
            guard += 1
            cat = random.choice(CATEGORIES)
            place = build_place(province, cat)
            if place["ten"] in seen:
                continue
            seen.add(place["ten"])
            place["mota"] = place["mota"] or (
                f"Đặc sản {place['monan'] or place['phanloai']} tại {place['tinh']}, "
                f"được yêu thích bởi người dân địa phương."
            )
            place["created_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            rows.append(place)
            made += 1
    return rows


def write_sql(rows, output_path, batch_size=200):
    header = f"""-- =============================================
-- FoodMap Vietnam - {len(rows)} quán ăn trên toàn quốc
-- Sinh ngày: {datetime.now().strftime('%d/%m/%Y %H:%M')}
-- Cách dùng: copy toàn bộ nội dung file này vào
--            Supabase SQL Editor rồi bấm RUN.
-- Ghi chú: nếu báo lỗi "column daduyet does not exist",
--          xóa chữ "daduyet," khỏi danh sách cột.
-- =============================================

"""
    body = []
    for i in range(0, len(rows), batch_size):
        chunk = rows[i : i + batch_size]
        values = ",\n".join(
            "(" + ", ".join(sql_value(c, r.get(c)) for c in COLUMNS) + ")" for r in chunk
        )
        body.append(
            f"INSERT INTO places ({', '.join(COLUMNS)}) VALUES\n{values};\n"
        )

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(header)
        f.write("\n".join(body))
    print(f"Da ghi {len(rows)} dong INSERT vao: {os.path.abspath(output_path)}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sinh file SQL 1000 quan an toan quoc")
    parser.add_argument("--total", type=int, default=1000)
    parser.add_argument("--output", type=str, default="../supabase-places-1000.sql")
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    rows = build_rows(args.total, args.seed)
    write_sql(rows, args.output)