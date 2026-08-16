import { Sandwich, UtensilsCrossed, Utensils, Soup, Fish, CakeSlice, Coffee } from 'lucide-react';
import { createElement, type ReactNode } from 'react';

export const heroImage = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1600&q=80';

export const provinces = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Đà Nẵng',
  'Huế',
  'Cần Thơ',
  'Hải Phòng',
  'An Giang',
  'Bà Rịa – Vũng Tàu',
  'Bạc Liêu',
  'Bắc Giang',
  'Bắc Kạn',
  'Bắc Ninh',
  'Bến Tre',
  'Bình Dương',
  'Bình Định',
  'Bình Phước',
  'Bình Thuận',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Đắk Nông',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Giang',
  'Hà Nam',
  'Hà Tĩnh',
  'Hải Dương',
  'Hậu Giang',
  'Hòa Bình',
  'Hưng Yên',
  'Khánh Hòa',
  'Kiên Giang',
  'Kon Tum',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Long An',
  'Nam Định',
  'Nghệ An',
  'Ninh Bình',
  'Ninh Thuận',
  'Phú Thọ',
  'Phú Yên',
  'Quảng Bình',
  'Quảng Nam',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sóc Trăng',
  'Sơn La',
  'Tây Ninh',
  'Thái Bình',
  'Thái Nguyên',
  'Thanh Hóa',
  'Tiền Giang',
  'Trà Vinh',
  'Tuyên Quang',
  'Vĩnh Long',
  'Vĩnh Phúc',
  'Yên Bái',
];
export const foodImages = [
  'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600&q=80',
  'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80',
];
export const nearbyImages = [
  'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',
  'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80',
  'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&q=80',
];

interface Category {
  title: string;
  count: string;
  icon: ReactNode;
  bg: string;
}

export const categories: Category[] = [
  { title: 'Bánh mì', count: '342 địa điểm', icon: createElement(Sandwich, { className: "h-6 w-6 text-orange-500" }), bg: 'bg-[#fff7ed] dark:bg-[#431407]/60' },
  { title: 'Phở', count: '218 địa điểm', icon: createElement(Soup, { className: "h-6 w-6 text-blue-500" }), bg: 'bg-[#eff6ff] dark:bg-[#172554]/60' },
  { title: 'Bún', count: '189 địa điểm', icon: createElement(UtensilsCrossed, { className: "h-6 w-6 text-green-500" }), bg: 'bg-[#f0fdf4] dark:bg-[#052e16]/60' },
  { title: 'Cơm', count: '276 địa điểm', icon: createElement(Utensils, { className: "h-6 w-6 text-fuchsia-500" }), bg: 'bg-[#fdf4ff] dark:bg-[#3b0764]/60' },
  { title: 'Hải sản', count: '157 địa điểm', icon: createElement(Fish, { className: "h-6 w-6 text-cyan-500" }), bg: 'bg-[#ecfeff] dark:bg-[#083344]/60' },
  { title: 'Đồ ngọt', count: '203 địa điểm', icon: createElement(CakeSlice, { className: "h-6 w-6 text-rose-500" }), bg: 'bg-[#fff1f2] dark:bg-[#4c0519]/60' },
  { title: 'Cà phê', count: '421 địa điểm', icon: createElement(Coffee, { className: "h-6 w-6 text-yellow-600" }), bg: 'bg-[#fefce8] dark:bg-[#422006]/60' },
];

interface FeaturedPlace {
  ten: string;
  trangthai: string;
  danhgia: string;
  khoangcach: string;
  gia: string;
  hinh: string;
}

export const featuredPlaces: FeaturedPlace[] = [
  { ten: 'Phở Thìn Bờ Hồ', trangthai: 'Đang mở', danhgia: '4.8 (1,240 đánh giá)', khoangcach: '0.8 km', gia: '50k–100k đ', hinh: foodImages[0] },
  { ten: 'Bánh mì Phượng Hội An', trangthai: 'Đang mở', danhgia: '4.9 (2,806 đánh giá)', khoangcach: '1.2 km', gia: '20k–40k đ', hinh: foodImages[1] },
  { ten: 'Bún bò Huế Bà Thảo', trangthai: 'Đóng cửa', danhgia: '4.6 (983 đánh giá)', khoangcach: '1.8 km', gia: '40k–70k đ', hinh: foodImages[2] },
  { ten: 'Cơm tấm Bình Dân Sài Gòn', trangthai: 'Đang mở', danhgia: '4.7 (1,654 đánh giá)', khoangcach: '0.5 km', gia: '30k–60k đ', hinh: foodImages[3] },
];

interface NearbyPlace {
  ten: string;
  huyhieu: string;
  trangthai: string;
  danhgia: string;
  khoangcach: string;
  gia: string;
  giomocua: string;
  diachi: string;
  hinh: string;
}

export const nearbyPlaces: NearbyPlace[] = [
  { ten: 'Phở Hà Nội Số 1', huyhieu: 'Phở', trangthai: 'Đang mở', danhgia: '4.8 · 1,024 đánh giá', khoangcach: '0.3 km', gia: '45k–80k đ', giomocua: '06:00 – 22:00', diachi: '123 Hàng Bồ, Hoàn Kiếm, Hà Nội', hinh: nearbyImages[0] },
  { ten: 'Bún bò Huế Đặc Biệt', huyhieu: 'Bún', trangthai: 'Đang mở', danhgia: '4.9 · 2,345 đánh giá', khoangcach: '1.1 km', gia: '50k–90k đ', giomocua: '07:00 – 21:00', diachi: '45 Nguyễn Huệ, Q.1, TP.HCM', hinh: nearbyImages[1] },
  { ten: 'Bánh mì Kim Sơn', huyhieu: 'Bánh mì', trangthai: 'Đang đóng', danhgia: '4.5 · 876 đánh giá', khoangcach: '0.7 km', gia: '20k–35k đ', giomocua: '06:00 – 20:00', diachi: '78 Trần Phú, Hội An, Quảng Nam', hinh: nearbyImages[2] },
];

export const mapPlaceImage = 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80';
export const mapPlaceImage1 = 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&q=80';
export const mapPlaceImage2 = 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=400&q=80';

interface GalleryImage {
  src: string;
  alt: string;
}

export const destinationGallery: GalleryImage[] = [
  { src: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&q=80', alt: 'Bát phở truyền thống' },
  { src: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80', alt: 'Món phở và rau thơm' },
  { src: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&q=80', alt: 'Bánh phở và thịt bò' },
  { src: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600&q=80', alt: 'Không gian quán' },
  { src: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80', alt: 'Món ăn đặc sắc' },
];

export const destinationTabs = ['Tổng quan', 'Thực đơn', 'Đánh giá (1,024)', 'Ảnh'];

interface Review {
  ten: string;
  date: string;
  avatar: string;
  color: string;
  text: string;
}

export const destinationReviews: Review[] = [
  {
    ten: 'Nguyễn Thanh Hà',
    date: '21 tháng 6, 2026',
    avatar: 'N',
    color: 'bg-[#3b82f6]',
    text: 'Phở ở đây ngon xuất sắc! Nước dùng đậm đà, thơm mùa quế hồi rất tự nhiên. Thịt bò tươi và mềm. Sẽ quay lại thường xuyên!',
  },
  {
    ten: 'Trần Minh Khoa',
    date: '18 tháng 6, 2026',
    avatar: 'T',
    color: 'bg-[#22c55e]',
    text: 'Quán phở cổ điển nhưng chất lượng không hề cổ. Phở bò tái lăn siêu ngon, nước dùng trong vắt mà đậm vị lắm. Giá cả hợp lý.',
  },
];
