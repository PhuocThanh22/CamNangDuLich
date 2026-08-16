'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  ArrowLeft, Clock3, Heart, MapPin, MessageCircle,
  Navigation2, Phone, Share2, Star, DollarSign,
  Utensils, Banknote, Construction, Image,
  UtensilsCrossed
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { destinationGallery } from '@/utils/constants';
import { placeService } from '@/services/placeService';
import { getStatusFromHours } from '@/lib/utils';
import { getToken, getUser } from '@/services/authService';
import ReviewForm from '@/components/place/ReviewForm';

const PlaceMiniMap = dynamic(
  () => import('@/components/place/PlaceMiniMap'),
  { ssr: false }
);

const HOURS = [
  { day: 'Thứ 2 – Thứ 6', time: '06:00 – 22:00' },
  { day: 'Thứ 7', time: '06:00 – 23:00' },
  { day: 'Chủ nhật', time: '07:00 – 20:00' },
];

interface ReviewItem {
  id: number;
  nguoidung_id: number;
  diadiem_id: number;
  diemdanhgia: number;
  noidung?: string;
  created_at?: string;
  nguoidung_ten?: string;
  nguoidung_avatar?: string;
}

interface PlaceItem {
  id?: number;
  nguoidung_id?: number;
  ten: string;
  trangthai?: string;
  danhgia?: string;
  luotdanhgia?: string;
  khoangcach?: string;
  gia?: string;
  huyhieu?: string;
  phanloai?: string;
  diachi?: string;
  dienthoai?: string;
  khunggia?: string;
  vido?: number;
  kinhdo?: number;
  hinh?: string;
  danhsachhinh?: string;
  mota?: string;
  monan?: string;
  tienich?: string;
  trangweb?: string;
  giohoatdong?: string;
  giomocua?: string;
  daduyet?: boolean;
}

interface MenuItem {
  id: number;
  diadiem_id: number;
  ten: string;
  gia?: string;
  mota?: string;
  hinh?: string;
}

interface PlaceImageItem {
  id: number;
  diadiem_id: number;
  url: string;
  alt?: string;
}

function ReviewTab({ reviews, avgRating }: { reviews: ReviewItem[]; avgRating: string }) {
  return (
    <motion.div
      key="reviews"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="space-y-5"
    >
      <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-slate-900">Đánh giá từ cộng đồng</h2>
          <span className="rounded-lg bg-blue-600 px-2 py-0.5 text-[13px] font-bold text-white">{avgRating}</span>
        </div>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-100 p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {review.nguoidung_avatar ? (
                      <img src={review.nguoidung_avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[13px] font-bold text-white">
                        {(review.nguoidung_ten || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-[14px] font-semibold text-slate-800">{review.nguoidung_ten || 'Ẩn danh'}</p>
                      <p className="text-[12px] text-slate-400">{review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : ''}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= Math.round(review.diemdanhgia) ? 'fill-current' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                {review.noidung && (
                  <p className="text-[13px] leading-relaxed text-slate-600">{review.noidung}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-[14px] text-slate-400">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
        )}
      </div>
    </motion.div>
  );
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex text-amber-400">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(value) ? 'fill-current' : 'text-slate-200'}`} />
      ))}
    </div>
  );
}

export default function PlacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImg, setSelectedImg] = useState<{ src: string; alt: string } | null>(null);
  const [item, setItem] = useState<PlaceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [placeImages, setPlaceImages] = useState<PlaceImageItem[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [menuFormData, setMenuFormData] = useState({ ten: '', gia: '', mota: '', hinh: '' });
  const [currentUser, setCurrentUser] = useState(getUser());
  const tabs = ['Tổng quan', 'Thực đơn', `Đánh giá (${reviews.length || 0})`, 'Ảnh'];
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.diemdanhgia, 0) / reviews.length).toFixed(1)
    : item?.danhgia || '0';

  const fetchReviews = useCallback(async (placeId: number) => {
    try {
      const res = await placeService.getReviews(placeId);
      setReviews(res.data || []);
    } catch {
      setReviews([]);
    }
  }, []);

  const fetchMenu = useCallback(async (placeId: number) => {
    try {
      const res = await placeService.getMenuItems(placeId);
      setMenuItems(res.data || []);
    } catch {
      setMenuItems([]);
    }
  }, []);

  const fetchImages = useCallback(async (placeId: number) => {
    try {
      const res = await placeService.getPlaceImages(placeId);
      setPlaceImages(res.data || []);
    } catch {
      setPlaceImages([]);
    }
  }, []);

  useEffect(() => {
    const id = parseInt(params.id, 10);
    if (!isNaN(id)) {
      placeService.getById(id)
        .then((res) => {
          setItem(res.data);
          fetchReviews(id);
          fetchMenu(id);
          fetchImages(id);
          if (getToken()) {
            placeService.getFavorites()
              .then((favRes) => {
                const favIds = ((favRes.data || []) as PlaceItem[]).map((p) => p.id);
                setIsFavorite(favIds.includes(id));
              })
              .catch(() => {});
          }
        })
        .catch(() => {
          setItem({
            id: id,
            ten: decodeURIComponent(params.id),
            trangthai: 'Đang mở cửa',
            danhgia: '4.8',
            luotdanhgia: '1,024 đánh giá',
            khoangcach: '0.3km',
            gia: '45k–80k đ',
            huyhieu: 'Phở',
            diachi: '123 Hàng Bồ, phường Hàng Bồ, quận Hoàn Kiếm, Hà Nội',
            dienthoai: '(024) 3825 7162',
            khunggia: '45,000 – 80,000 VND',
            vido: 21.035,
            kinhdo: 105.849,
            hinh: destinationGallery[0].src,
          });
        })
        .finally(() => setLoading(false));
    } else {
      setItem({
        ten: decodeURIComponent(params.id),
        trangthai: 'Đang mở cửa',
        danhgia: '4.8',
        luotdanhgia: '1,024 đánh giá',
        khoangcach: '0.3km',
        gia: '45k–80k đ',
        huyhieu: 'Phở',
        diachi: '123 Hàng Bồ, phường Hàng Bồ, quận Hoàn Kiếm, Hà Nội',
        dienthoai: '(024) 3825 7162',
        khunggia: '45,000 – 80,000 VND',
        vido: 21.035,
        kinhdo: 105.849,
        hinh: destinationGallery[0].src,
      });
      setLoading(false);
    }
  }, [params.id, fetchReviews, fetchMenu, fetchImages]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <p className="text-[14px] text-slate-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-center">
          <p className="text-[16px] font-semibold text-slate-600">Không tìm thấy địa điểm</p>
          <button onClick={() => router.back()} className="mt-4 text-[14px] text-blue-600 underline">Quay lại</button>
        </div>
      </div>
    );
  }

  const coords: [number, number] = [item.vido || 21.035, item.kinhdo || 105.849];

  const allImages: { src: string; alt: string }[] = [];
  if (item.hinh) allImages.push({ src: item.hinh, alt: item.ten });
  placeImages.forEach((img) => allImages.push({ src: img.url, alt: img.alt || item.ten }));
  const galleryImages = allImages.length > 0
    ? allImages
    : item.danhsachhinh
      ? item.danhsachhinh.split(',').map((url, i) => ({ src: url.trim(), alt: `${item.ten} ${i + 1}` }))
      : destinationGallery;

  const isOwner = currentUser && (item?.nguoidung_id === currentUser.id || currentUser.vaitro === 'admin');

  const handleAddMenuItem = async () => {
    if (!menuFormData.ten.trim()) return;
    try {
      await placeService.createMenuItem(parseInt(params.id, 10), menuFormData);
      setShowMenuForm(false);
      setMenuFormData({ ten: '', gia: '', mota: '', hinh: '' });
      fetchMenu(parseInt(params.id, 10));
    } catch {}
  };

  const handleDeleteMenuItem = async (itemId: number) => {
    try {
      await placeService.deleteMenuItem(parseInt(params.id, 10), itemId);
      fetchMenu(parseInt(params.id, 10));
    } catch {}
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-white">
        <div className="mx-auto max-w-5xl px-5 pt-6 sm:px-8 lg:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>

          <div className="grid h-[300px] grid-cols-2 gap-2 overflow-hidden rounded-2xl sm:h-[380px]">
            <div
              className="group relative cursor-pointer overflow-hidden"
              onClick={() => setSelectedImg(galleryImages[0])}
            >
              <img
                src={item.hinh || galleryImages[0]?.src || destinationGallery[0].src}
                alt={item.ten}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/15" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {galleryImages.slice(1, 6).map((img, idx) => (
                <div
                  key={idx}
                  className="group relative cursor-pointer overflow-hidden"
                  onClick={() => setSelectedImg(img)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  {idx === 4 && galleryImages.length > 6 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="text-[13px] font-bold text-white">+{galleryImages.length - 6} ảnh</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-5xl px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-[12px] font-semibold text-blue-700">
                  <Utensils className="h-3.5 w-3.5" /> {item.huyhieu || item.phanloai || 'Phở'}
                </span>
                <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${
                  getStatusFromHours(item.giohoatdong || item.giomocua) === 'Đang mở'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-50 text-red-500'
                }`}>
                  ● {getStatusFromHours(item.giohoatdong || item.giomocua)}
                </span>
                {item.daduyet === false && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-700">
                    ● Chờ duyệt
                  </span>
                )}
              </div>

              <h1 className="mb-2 text-[24px] font-black text-slate-900 sm:text-[28px]">{item.ten}</h1>

              <div className="flex flex-wrap items-center gap-4 text-[13px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-lg bg-blue-600 px-1.5 py-0.5 text-[13px] font-bold text-white">
                    {avgRating}
                  </span>
                  <StarRating value={parseFloat(avgRating)} />
                  <span className="text-slate-400">({reviews.length || item?.luotdanhgia || '0 đánh giá'})</span>
                </div>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  {item.khoangcach || '0.3km'}
                </span>
                <span className="flex items-center gap-1 font-medium text-green-700">
                  <Banknote className="h-4 w-4" /> {item.gia || '45k–80k đ'}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-[#2563eb]"
                >
                  <Navigation2 className="h-4 w-4" />
                  Chỉ đường
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 text-[13px] font-bold text-blue-700 transition hover:bg-blue-100"
                >
                  <MapPin className="h-4 w-4" />
                  Xem trên bản đồ
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!getToken()) { router.push('/login'); return; }
                    try {
                      await placeService.toggleFavorite(item.id!);
                      setIsFavorite(!isFavorite);
                    } catch {}
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-[13px] font-semibold transition ${
                    isFavorite
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  Lưu
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-[60px] z-40 border-b border-slate-100 bg-white shadow-sm">
        <div className="mx-auto flex max-w-5xl overflow-x-auto px-5 scrollbar-hide sm:px-8 lg:px-10">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative mr-6 shrink-0 whitespace-nowrap py-4 text-[14px] font-semibold transition-colors ${
                activeTab === tab ? 'text-[#3b82f6]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="place-tab"
                  className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#3b82f6]"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <AnimatePresence mode="wait">
              {activeTab === 'Tổng quan' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                    <h2 className="mb-3 text-[17px] font-bold text-slate-900">Giới thiệu</h2>
                    <p className="text-[14px] leading-relaxed text-slate-600">
                      {item.mota || `${item.ten} là quán ăn nổi tiếng được nhiều thực khách yêu thích.`}
                    </p>
                  </div>

                  {(item.monan || item.tienich || item.trangweb) && (
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                      <h2 className="mb-4 text-[16px] font-bold text-slate-900">Thông tin chi tiết</h2>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {item.monan && (
                          <div>
                            <p className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-400">Món đặc trưng</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.monan.split(',').map((m, i) => (
                                <span key={i} className="rounded-lg bg-orange-50 px-2.5 py-1 text-[13px] font-medium text-orange-700">{m.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.tienich && (
                          <div>
                            <p className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-400">Tiện ích</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.tienich.split(',').map((t, i) => (
                                <span key={i} className="rounded-lg bg-green-50 px-2.5 py-1 text-[13px] font-medium text-green-700">{t.trim()}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {item.trangweb && (
                          <div>
                            <p className="mb-1 text-[12px] font-semibold uppercase tracking-wider text-slate-400">Trang web</p>
                            <a href={item.trangweb} target="_blank" rel="noopener noreferrer" className="text-[14px] text-blue-600 hover:underline">
                              {item.trangweb.replace(/^https?:\/\//, '')}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                    <div className="mb-4 flex items-center gap-2 text-slate-800">
                      <Clock3 className="h-4 w-4 text-blue-500" />
                      <h2 className="text-[16px] font-bold">Giờ mở cửa</h2>
                    </div>
                    {item.giohoatdong ? (
                      <p className="text-[14px] text-slate-600">{item.giohoatdong}</p>
                    ) : (
                      <div className="space-y-2">
                        {HOURS.map((h) => (
                          <div key={h.day} className="flex items-center justify-between text-[14px]">
                            <span className="text-slate-600">{h.day}</span>
                            <span className="font-semibold text-slate-800">{h.time}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {reviews.length > 0 && (
                    <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                      <div className="mb-5 flex items-center gap-3">
                        <h2 className="text-[17px] font-bold text-slate-900">Đánh giá từ cộng đồng</h2>
                        <span className="rounded-lg bg-blue-600 px-2 py-0.5 text-[13px] font-bold text-white">{avgRating}</span>
                      </div>
                      <div className="space-y-4">
                        {reviews.slice(0, 3).map((review) => (
                          <div key={review.id} className="rounded-xl border border-slate-100 p-4">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                {review.nguoidung_avatar ? (
                                  <img src={review.nguoidung_avatar} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                                ) : (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[13px] font-bold text-white">
                                    {(review.nguoidung_ten || '?')[0].toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <p className="text-[14px] font-semibold text-slate-800">{review.nguoidung_ten || 'Ẩn danh'}</p>
                                  <p className="text-[12px] text-slate-400">{review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : ''}</p>
                                </div>
                              </div>
                              <div className="flex shrink-0 text-amber-400">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(review.diemdanhgia) ? 'fill-current' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            {review.noidung && (
                              <p className="text-[13px] leading-relaxed text-slate-600">{review.noidung}</p>
                            )}
                          </div>
                        ))}
                      </div>
                      {reviews.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab(`Đánh giá (${reviews.length})`)}
                          className="mt-4 w-full rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-[13px] font-bold text-blue-700 transition hover:bg-blue-100"
                        >
                          Xem tất cả {reviews.length} đánh giá
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab.startsWith('Đánh giá') && (
                <ReviewTab
                  reviews={reviews}
                  avgRating={avgRating}
                />
              )}

              {activeTab === 'Thực đơn' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                    <div className="mb-5 flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-orange-500" />
                      <h2 className="text-[17px] font-bold text-slate-900">Thực đơn</h2>
                      {menuItems.length > 0 && (
                        <span className="rounded-lg bg-orange-100 px-2.5 py-0.5 text-[12px] font-semibold text-orange-700">
                          {menuItems.length} món
                        </span>
                      )}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => setShowMenuForm(true)}
                          className="ml-auto rounded-xl bg-orange-500 px-4 py-1.5 text-[13px] font-bold text-white transition hover:bg-orange-600"
                        >
                          + Thêm món
                        </button>
                      )}
                    </div>
                    {menuItems.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {menuItems.map((menuItem) => (
                          <div key={menuItem.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                            {menuItem.hinh && (
                              <img
                                src={menuItem.hinh}
                                alt={menuItem.ten}
                                className="h-20 w-20 shrink-0 rounded-xl object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <div className="mb-1 flex items-start justify-between gap-2">
                                <h3 className="text-[14px] font-semibold text-slate-800">{menuItem.ten}</h3>
                                {menuItem.gia && (
                                  <span className="shrink-0 text-[14px] font-bold text-green-700">{menuItem.gia}</span>
                                )}
                              </div>
                              {menuItem.mota && (
                                <p className="text-[13px] text-slate-500">{menuItem.mota}</p>
                              )}
                            </div>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMenuItem(menuItem.id)}
                                className="shrink-0 self-center text-slate-300 transition hover:text-red-500"
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 text-center">
                        <UtensilsCrossed className="mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-[14px] text-slate-400">Chưa có thực đơn</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'Ảnh' && (
                <motion.div
                  key="photos"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
                    <div className="mb-5 flex items-center gap-2">
                      <Image className="h-5 w-5 text-blue-500" />
                      <h2 className="text-[17px] font-bold text-slate-900">Thư viện ảnh</h2>
                      {galleryImages.length > 0 && (
                        <span className="ml-auto rounded-lg bg-blue-100 px-2.5 py-0.5 text-[12px] font-semibold text-blue-700">
                          {galleryImages.length} ảnh
                        </span>
                      )}
                    </div>
                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {galleryImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="group relative cursor-pointer overflow-hidden rounded-xl"
                            onClick={() => setSelectedImg(img)}
                          >
                            <img
                              src={img.src}
                              alt={img.alt}
                              className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Image className="mb-3 h-10 w-10 text-slate-300" />
                        <p className="text-[14px] text-slate-400">Chưa có ảnh</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab !== 'Tổng quan' && activeTab !== 'Thực đơn' && !activeTab.startsWith('Đánh giá') && activeTab !== 'Ảnh' && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center rounded-2xl bg-white p-12 text-center shadow-[0_2px_16px_rgba(0,0,0,0.05)]"
                >
                  <Construction className="mb-4 h-12 w-12 text-slate-300" />
                  <h3 className="mb-2 text-[16px] font-bold text-slate-800">Đang cập nhật</h3>
                  <p className="text-[14px] text-slate-500">Nội dung &quot;{activeTab}&quot; sẽ sớm được thêm vào.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <h3 className="mb-4 text-[15px] font-bold text-slate-900">Thông tin địa điểm</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-[13px] text-slate-600">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                  <span className="leading-relaxed">{item.diachi || '123 Hàng Bồ, phường Hàng Bồ, quận Hoàn Kiếm, Hà Nội'}</span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-slate-600">
                  <Phone className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>{item.dienthoai || '(024) 3825 7162'}</span>
                </li>
                <li className="flex items-center gap-2.5 text-[13px] text-slate-600">
                  <DollarSign className="h-4 w-4 shrink-0 text-blue-500" />
                  <span>{item.khunggia || '45,000 – 80,000 VND'}</span>
                </li>
              </ul>
            </div>

            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.05)]">
              <PlaceMiniMap coords={coords} />
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#1d4ed8] p-6 text-white shadow-[0_8px_24px_rgba(59,130,246,0.3)]">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <MessageCircle className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-[15px] font-bold">Bạn đã từng đến đây?</h3>
              <p className="mb-4 text-[13px] leading-relaxed text-white/75">
                Chia sẻ trải nghiệm của bạn với cộng đồng FoodMap.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!getToken()) { router.push('/login'); return; }
                  setShowReviewForm(true);
                }}
                className="w-full rounded-xl bg-white py-2.5 text-[13px] font-bold text-[#3b82f6] transition hover:bg-slate-50"
              >
                Viết đánh giá
              </button>
            </div>
          </div>
        </div>
      </div>

      <ReviewForm
        placeId={parseInt(params.id, 10)}
        open={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        onSuccess={() => fetchReviews(parseInt(params.id, 10))}
      />

      <AnimatePresence>
        {showMenuForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMenuForm(false)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="mb-5 text-[17px] font-bold text-slate-900">Thêm món mới</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-slate-600">Tên món *</label>
                  <input
                    type="text"
                    value={menuFormData.ten}
                    onChange={(e) => setMenuFormData({ ...menuFormData, ten: e.target.value })}
                    placeholder="VD: Phở bò tái"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none transition focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-slate-600">Giá</label>
                  <input
                    type="text"
                    value={menuFormData.gia}
                    onChange={(e) => setMenuFormData({ ...menuFormData, gia: e.target.value })}
                    placeholder="VD: 50,000 VND"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none transition focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-slate-600">Mô tả</label>
                  <textarea
                    value={menuFormData.mota}
                    onChange={(e) => setMenuFormData({ ...menuFormData, mota: e.target.value })}
                    placeholder="Mô tả ngắn về món ăn"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none transition focus:border-blue-400"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[13px] font-semibold text-slate-600">URL ảnh</label>
                  <input
                    type="text"
                    value={menuFormData.hinh}
                    onChange={(e) => setMenuFormData({ ...menuFormData, hinh: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-[14px] outline-none transition focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowMenuForm(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAddMenuItem}
                  disabled={!menuFormData.ten.trim()}
                  className="flex-1 rounded-xl bg-orange-500 py-2.5 text-[13px] font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  Thêm món
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImg.src}
              alt={selectedImg.alt}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
