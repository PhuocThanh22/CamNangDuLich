# Changelog

## Các chức năng đã sửa / cải thiện

### 1. Định vị GPS (Geolocation)
- Thêm thông báo lỗi chi tiết khi định vị thất bại (từ chối quyền, timeout, không xác định được)
- Giảm timeout từ 10s → 8s, thêm `maximumAge: 5000` để cache nhanh hơn
- File: `frontend/src/components/map/MapClient.tsx`

### 2. Debounce thanh kéo bán kính (Radius Slider)
- Thêm `committedRadius` state: chỉ cập nhật khi thả chuột/ngón tay
- Circle và danh sách địa điểm chỉ render lại khi `committedRadius` thay đổi
- File: `frontend/src/components/map/MapClient.tsx`

### 3. Responsive UI toàn bộ ứng dụng
- **Map**: container đổi từ `h-full w-full` → `absolute inset-0`, sidebar `w-[85vw] max-w-[320px]`
- **ClientLayout**: `100vh` → `100dvh` (xử lý thanh địa chỉ mobile)
- **Admin page**: nút Duyệt/Từ chối xuống dòng trên mobile (flex-col)
- **Home page**: grid danh mục 4→3 cột trên mobile, icon/padding nhỏ hơn
- **Hero**: stats bar padding và text nhỏ hơn trên mobile, tiêu đề 42→32px
- **Navbar**: thêm `truncate` cho tên người dùng trên mobile
- **Login**: padding p-8→p-6 trên mobile
- **Map**: globe info card `w-80` → `w-[90vw] max-w-[320px]`
- Các file: `MapClient.tsx`, `ClientLayout.tsx`, `page.tsx`, `Hero.tsx`, `Navbar.tsx`, `admin/page.tsx`, `login/page.tsx`, `CategoryCard.tsx`

### 4. CSS imports - Fix lỗi TypeScript
- Chuyển `import 'leaflet/dist/leaflet.css'` từ component lên page level
- File: `MapPicker.tsx`, `MapClient.tsx`, `add/page.tsx`, `map/page.tsx`

### 5. Nút "Xem tất cả" ở trang chủ
- 3 nút "Xem tất cả" + "Xem tất cả trên bản đồ" đều chuyển đến `/map`
- File: `frontend/src/app/page.tsx`

### 6. Bộ lọc "Quán ăn đang được yêu thích"
- **Tất cả**: hiển thị toàn bộ
- **Gần tôi**: sắp xếp theo khoảng cách tăng dần
- **Đang mở**: lọc theo trạng thái mở
- **Đánh giá cao**: sắp xếp theo điểm giảm dần
- File: `frontend/src/app/page.tsx`

### 7. Gọi API lấy dữ liệu địa điểm
- Thay vì gọi `getNearby({ limit: 3 })`, dùng `getAll({ limit: 50 })` để lấy nhiều dữ liệu hơn
- Featured: lọc 4 địa điểm nổi bật
- Nearby: lấy 6 địa điểm đầu
- File: `frontend/src/app/page.tsx`

### 8. Tính khoảng cách thực tế từ GPS
- Dùng công thức Haversine tính km/m từ tọa độ người dùng đến địa điểm
- Áp dụng cho cả Featured và Nearby section
- File: `frontend/src/app/page.tsx`, `FoodCard.tsx`

### 9. Trạng thái động theo giờ Việt Nam (UTC+7)
- Hàm `getStatusFromHours()` parse `giomocua` và so sánh với giờ hiện tại
- Trả về "Đang mở" hoặc "Đang đóng"
- File: `frontend/src/lib/utils.ts`

### 10. Chuẩn hóa trạng thái toàn hệ thống
- **"Đang mở"** → màu xanh lá (`bg-green-50 text-green-600`)
- **"Đang đóng"** → màu đỏ (`bg-red-50 text-red-500`)
- Áp dụng ở: trang chủ, FoodCard, MapClient, trang chi tiết địa điểm
- Các file: `page.tsx`, `FoodCard.tsx`, `MapClient.tsx`, `place/[id]/page.tsx`, `constants.ts`, `utils.ts`

### 11. Badge trạng thái trên bản đồ
- Hiển thị "Đang mở"/"Đang đóng" bên cạnh tên địa điểm trong sidebar map
- File: `frontend/src/components/map/MapClient.tsx`
