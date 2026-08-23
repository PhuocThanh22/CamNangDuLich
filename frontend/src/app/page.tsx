'use client';

import React, { useEffect, useRef, useState, useMemo, createElement } from 'react';
import { ChevronDown, Sparkles, LocateFixed, Clock3, Star, Map, ArrowRight, List, Navigation, MapPin, Sandwich, Soup, UtensilsCrossed, Utensils, Fish, CakeSlice, Coffee, CookingPot, CupSoda, EggFried } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Hero from '@/components/home/Hero';
import ContributionSection from '@/components/home/ContributionSection';
import CategoryCard from '@/components/ui/CategoryCard';
import FoodCard from '@/components/ui/FoodCard';
import StarRating from '@/components/ui/StarRating';
import { categories as fallbackCategories, featuredPlaces as fallbackFeatured, nearbyPlaces as fallbackNearby } from '@/utils/constants';
import { placeService } from '@/services/placeService';
import { getStatusFromHours } from '@/lib/utils';
import type { Variants } from 'framer-motion';

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

import { foodImages, nearbyImages, provinces as fallbackProvinces } from '@/utils/constants';

function HomeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={sectionVariants}
      className={className}
    >
      {children}
    </motion.section>
  );
}

interface FeaturedItem {
  id?: number | string;
  ten: string;
  trangthai: string;
  danhgia?: string;
  diemdanhgia?: number | null;
  khoangcach: string;
  gia: string;
  hinh: string;
  vido?: number;
  kinhdo?: number;
  giomocua?: string;
  giohoatdong?: string;
  tinh?: string;
}

interface NearbyItem {
  id?: number | string;
  ten: string;
  huyhieu: string;
  trangthai: string;
  danhgia?: string;
  diemdanhgia?: number | null;
  khoangcach: string;
  gia: string;
  giomocua: string;
  giohoatdong?: string;
  diachi: string;
  hinh: string;
  vido?: number;
  kinhdo?: number;
}

const mapToFeatured = (item: Record<string, unknown>, index: number): FeaturedItem => ({
  id: item.id as number | undefined,
  ten: item.ten as string,
  trangthai: (item.trangthai as string) || 'Đang mở',
  danhgia: (item.danhgia as string) || '',
  diemdanhgia: item.diemdanhgia as number | null,
  khoangcach: (item.khoangcach as string) || '0.8 km',
  gia: (item.gia as string) || '30k–100k đ',
  hinh: (item.hinh as string) || foodImages[index % foodImages.length],
  vido: item.vido as number | undefined,
  kinhdo: item.kinhdo as number | undefined,
  giomocua: (item.giomocua as string) || undefined,
  giohoatdong: (item.giohoatdong as string) || undefined,
  tinh: (item.tinh as string) || undefined,
});

const mapToNearby = (item: Record<string, unknown>, index: number): NearbyItem => ({
  id: item.id as number | undefined,
  ten: item.ten as string,
  huyhieu: (item.huyhieu as string) || (item.phanloai as string) || 'Phở',
  trangthai: (item.trangthai as string) || 'Đang mở',
  danhgia: (item.danhgia as string) || '',
  diemdanhgia: item.diemdanhgia as number | null,
  khoangcach: (item.khoangcach as string) || '0.5 km',
  gia: (item.gia as string) || '30k–100k đ',
  giomocua: (item.giomocua as string) || '06:00 – 22:00',
  giohoatdong: (item.giohoatdong as string) || (item.giomocua as string) || undefined,
  diachi: (item.diachi as string) || '',
  hinh: (item.hinh as string) || nearbyImages[index % nearbyImages.length],
  vido: item.vido as number | undefined,
  kinhdo: item.kinhdo as number | undefined,
});

interface Filter {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export default function HomePage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [featuredPlaces, setFeaturedPlaces] = useState<FeaturedItem[]>(fallbackFeatured);
  const [allPlaces, setAllPlaces] = useState<NearbyItem[]>(fallbackNearby);
  const [nearbyResults, setNearbyResults] = useState<NearbyItem[] | null>(null);
  const [categoriesList, setCategoriesList] = useState<{ title: string; count: string; icon: React.ReactNode; bg: string }[]>(fallbackCategories);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState('all');
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  function requestLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

  function calcDistance(lat1: number, lng1: number, lat2: number, lng2: number): string {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    if (d < 1) return `${Math.round(d * 1000)} m`;
    return `${d.toFixed(1)} km`;
  }

  function parseKm(dist: string): number {
    const cleaned = dist.replace(/,/g, '.');
    const m = cleaned.match(/([\d.]+)\s*m$/);
    if (m) return parseFloat(m[1]) / 1000;
    const km = cleaned.match(/([\d.]+)\s*km/);
    return km ? parseFloat(km[1]) : Infinity;
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const [allRes, catRes] = await Promise.all([
          placeService.getAll({ limit: 1000, sort_by: 'rating' }),
          placeService.getCategories(),
        ]);
        const allData = allRes.data as Record<string, unknown>[];
        if (allData?.length) {
          const mapped = allData.map(mapToNearby);
          if (mapped.length) setAllPlaces(mapped);

          const provs = Array.from(new Set(allData.map((p) => (p.tinh as string) || '').filter(Boolean)));
          if (provs.length) setAvailableProvinces(provs);
        }
        if ((catRes.data as Record<string, unknown>[])?.length) {
          const catIcons: Record<string, React.ComponentType<{ className?: string }>> = { 'Bánh mì': Sandwich, 'Phở': Soup, 'Bún': UtensilsCrossed, 'Cơm': Utensils, 'Hải sản': Fish, 'Đồ ngọt': CakeSlice, 'Cà phê': Coffee, 'Lẩu': CookingPot, 'Chè': CupSoda, 'Bánh xèo': EggFried };
          const catBgs: Record<string, string> = { 'Bánh mì': 'bg-[#fed7aa] dark:bg-[#431407]/60', 'Phở': 'bg-[#bfdbfe] dark:bg-[#172554]/60', 'Bún': 'bg-[#bbf7d0] dark:bg-[#052e16]/60', 'Cơm': 'bg-[#f5d0fe] dark:bg-[#3b0764]/60', 'Hải sản': 'bg-[#a5f3fc] dark:bg-[#083344]/60', 'Đồ ngọt': 'bg-[#fecdd3] dark:bg-[#4c0519]/60', 'Cà phê': 'bg-[#fde68a] dark:bg-[#422006]/60', 'Lẩu': 'bg-[#fca5a5] dark:bg-[#7f1d1d]/60', 'Chè': 'bg-[#99f6e4] dark:bg-[#134e4a]/60', 'Bánh xèo': 'bg-[#fdba74] dark:bg-[#7c2d12]/60' };
          const catIconColors: Record<string, string> = { 'Lẩu': 'text-red-500', 'Chè': 'text-teal-600', 'Bánh xèo': 'text-orange-600' };
          const catOrder = ['Bánh mì', 'Phở', 'Bún', 'Cơm', 'Hải sản', 'Đồ ngọt', 'Cà phê', 'Lẩu', 'Chè', 'Bánh xèo'];
          const rawCats = catRes.data as { title?: string; phanloai?: string; count?: number }[];
          const sortedCats = [...rawCats].sort((a, b) => {
            const titleA = (a.title || a.phanloai) as string;
            const titleB = (b.title || b.phanloai) as string;
            const ia = catOrder.indexOf(titleA);
            const ib = catOrder.indexOf(titleB);
            if (ia !== -1 && ib !== -1) return ia - ib;
            if (ia !== -1) return -1;
            if (ib !== -1) return 1;
            return (b.count || 0) - (a.count || 0);
          });
          setCategoriesList(sortedCats.map((c) => ({
            title: (c.title || c.phanloai) as string,
            count: `${c.count} địa điểm`,
            icon: createElement(catIcons[c.title as string] || MapPin, { className: `h-6 w-6 ${catIconColors[c.title as string] || 'text-blue-500'}` }),
            bg: catBgs[c.title as string] || 'bg-[#f0f0f0]',
          })));
        }
      } catch {
        // fallback to hardcoded constants
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (activeFilter !== 'near' || !userLocation) {
      setNearbyResults(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await placeService.getNearby({
          lat: userLocation[0],
          lng: userLocation[1],
          radius_km: 10,
          limit: 50,
        });
        const data = res.data as Record<string, unknown>[];
        if (!cancelled) setNearbyResults((data || []).slice(0, 6).map(mapToNearby));
      } catch {
        if (!cancelled) setNearbyResults([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeFilter, userLocation]);

  const provinceOptions = availableProvinces.length > 0 ? availableProvinces : fallbackProvinces;

  useEffect(() => {
    let cancelled = false;
    async function fetchFeaturedByProvince() {
      try {
        const params: { limit: number; sort_by: string; tinh?: string } = { limit: 50, sort_by: 'rating' };
        if (selectedProvince !== 'all') params.tinh = selectedProvince;
        const res = await placeService.getAll(params);
        const data = res.data as Record<string, unknown>[];
        if (cancelled) return;
        const featured = (data || [])
          .filter((p) => p.noibat || p.danhgia)
          .slice(0, 4)
          .map(mapToFeatured);
        setFeaturedPlaces(featured);
      } catch {
        // keep current featured on error
      }
    }
    fetchFeaturedByProvince();
    return () => { cancelled = true; };
  }, [selectedProvince]);

  const filters: Filter[] = [
    { key: 'all', label: 'Tất cả', icon: <Sparkles className="h-3.5 w-3.5" /> },
    { key: 'near', label: 'Gần tôi', icon: <LocateFixed className="h-3.5 w-3.5" /> },
    { key: 'open', label: 'Đang mở', icon: <Clock3 className="h-3.5 w-3.5" /> },
    { key: 'top', label: 'Đánh giá cao', icon: <Star className="h-3.5 w-3.5" /> },
  ];

  const featuredWithDistance = useMemo(() => {
    return featuredPlaces.map((p) => {
      let updated = { ...p };
      if (userLocation && p.vido != null && p.kinhdo != null) {
        updated.khoangcach = calcDistance(userLocation[0], userLocation[1], p.vido, p.kinhdo);
      }
      updated.trangthai = getStatusFromHours(p.giohoatdong || p.giomocua);
      return updated;
    });
  }, [featuredPlaces, userLocation]);

  const filteredNearby = useMemo(() => {
    if (!userLocation) {
      return [];
    }
    let result: (NearbyItem & { distKm?: number })[] = [
      ...(activeFilter === 'near' && nearbyResults ? nearbyResults : allPlaces),
    ].map((p) => ({ ...p }));
    result = result.map((p) => {
      if (p.vido != null && p.kinhdo != null) {
        const d = calcDistance(userLocation[0], userLocation[1], p.vido, p.kinhdo);
        return { ...p, khoangcach: d, distKm: parseKm(d) };
      }
      return p;
    });
    result = result.filter((p) => p.distKm != null && p.distKm <= 10);
    result = result.map((p) => ({
      ...p,
      trangthai: getStatusFromHours(p.giohoatdong || p.giomocua),
    }));
    if (activeFilter === 'open') {
      result = result.filter((p) => p.trangthai === 'Đang mở');
    } else if (activeFilter === 'top') {
      result = result.sort((a, b) => (parseFloat(b.danhgia as string) || 0) - (parseFloat(a.danhgia as string) || 0));
    } else {
      result = result.sort((a, b) => (a.distKm ?? Infinity) - (b.distKm ?? Infinity));
    }
    return result.slice(0, 9);
  }, [allPlaces, nearbyResults, activeFilter, userLocation]);

  return (
    <div className="w-full bg-white dark:bg-[#0b1120]">
      <Hero />

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="bg-[#f8fafc] px-5 py-14 sm:px-8 lg:px-10 dark:bg-[#0f172a]"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-[#3b82f6]">
                DANH MỤC MÓN NGON
              </p>
              <h2 className="text-[28px] font-black tracking-tight text-slate-900 dark:text-white sm:text-[32px]">
                Khám phá theo danh mục
              </h2>
              <p className="mt-2 text-[14px] text-slate-500 dark:text-slate-400">
                Lựa chọn món yêu thích, tìm ngay quán ngon gần bạn
              </p>
            </div>
          </div>
          <motion.div
            variants={containerVariants}
            className="flex flex-wrap justify-center gap-3 sm:gap-4"
          >
            {categoriesList.map((cat) => (
              <motion.div
                key={cat.title}
                variants={cardVariants}
                className="w-[calc(50%-6px)] sm:w-[calc(25%-12px)] lg:w-[200px]"
              >
                <CategoryCard
                  {...cat}
                  onClick={() =>
                    router.push(`/map?cat=${encodeURIComponent(cat.title)}&radius=10`)
                  }
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <HomeSection className="bg-white px-5 py-14 sm:px-8 lg:px-10 dark:bg-[#0b1120]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-[#3b82f6]">
                ĐẶC SẢN ĐỊA PHƯƠNG
              </p>
              <h2 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white sm:text-[38px]">
                Những món không thể bỏ qua
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3b82f6]" />
                <select
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                  className="cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-9 text-[13px] font-semibold text-slate-700 shadow-sm outline-none transition hover:border-[#3b82f6] focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200 dark:hover:border-[#3b82f6]"
                >
                  <option value="all">Tất cả tỉnh/thành</option>
                  {provinceOptions.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
          {featuredWithDistance.length > 0 ? (
            <motion.div
              variants={containerVariants}
              className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
            >
              {featuredWithDistance.map((item) => (
                <motion.div key={(item.id as string) || item.ten} variants={cardVariants}>
                  <FoodCard item={item} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="rounded-2xl bg-slate-50 px-6 py-14 text-center dark:bg-slate-800/50">
              <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-300">
                {selectedProvince === 'all'
                  ? 'Chưa có dữ liệu địa điểm'
                  : `Chưa có món đặc sản nào ở ${selectedProvince}`}
              </p>
              <p className="mt-1 text-[13px] text-slate-400 dark:text-slate-500">
                {selectedProvince === 'all'
                  ? 'Hãy quay lại sau khi có dữ liệu.'
                  : 'Hãy là người đầu tiên đóng góp địa điểm cho tỉnh này!'}
              </p>
            </div>
          )}
        </div>
      </HomeSection>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="bg-[#f8fafc] px-5 py-14 sm:px-8 lg:px-10 dark:bg-[#0f172a]"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[1.5px] text-[#3b82f6]">
                GẦN BẠN NHẤT
              </p>
              <h2 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white sm:text-[38px]">
                Quán ăn đang được yêu thích
              </h2>
            </div>
          </div>

          <div className="mb-7 flex flex-wrap items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() =>
                  setActiveFilter((prev) => (prev === f.key ? 'all' : f.key))
                }
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition-all ${
                  activeFilter === f.key
                    ? 'bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)]'
                    : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {f.icon}
                {f.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {filteredNearby.map((item) => (
              <motion.article
                key={(item.id as string) || item.ten}
                onClick={() => {
                  if (item.id) router.push(`/place/${item.id}`);
                }}
                onKeyDown={(e) => {
                  if (item.id && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    router.push(`/place/${item.id}`);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Xem chi tiết ${item.ten}`}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_32px_rgba(0,0,0,0.12)] dark:bg-[#111a2e] dark:shadow-[0_2px_16px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
              >
                <div className="relative h-[140px] w-[120px] shrink-0 overflow-hidden">
                  <img
                    src={item.hinh}
                    alt={item.ten}
                    className="h-full w-full object-cover transition duration-500 hover:scale-110"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-bold leading-snug text-slate-900 dark:text-white">{item.ten}</h3>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          item.trangthai === 'Đang mở'
                            ? 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                            : 'bg-red-50 text-red-500 dark:bg-red-900/40 dark:text-red-400'
                        }`}
                      >
                        {item.trangthai}
                      </span>
                    </div>
                    <span className="mb-2 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">
                      {item.huyhieu}
                    </span>
                    <div className="mb-1.5 flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                      <StarRating value={item.diemdanhgia} label={item.danhgia} />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-slate-400 dark:text-slate-500">
                    <span><MapPin className="h-3 w-3 inline" /> {item.khoangcach}</span>
                    <span className="font-semibold text-orange-500">{item.gia}</span>
                    <span><Clock3 className="h-3 w-3 inline" /> {item.giomocua}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredNearby.length === 0 && (
            <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-sm dark:bg-[#111a2e]">
              <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-300">
                {!userLocation
                  ? 'Bạn cần bật định vị (GPS) để xem quán gần bạn trong bán kính 10 km'
                  : 'Không có quán ăn nào trong bán kính 10 km phù hợp với bộ lọc hiện tại'}
              </p>
              {!userLocation ? (
                <button
                  type="button"
                  onClick={requestLocation}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#2563eb]"
                >
                  <LocateFixed className="h-3.5 w-3.5" />
                  Bật định vị
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#3b82f6] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#2563eb]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Xem tất cả quán
                </button>
              )}
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => router.push('/map')}
              className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3.5 text-[14px] font-bold text-white sm:px-8 shadow-[0_8px_20px_rgba(59,130,246,0.4)] transition hover:bg-[#2563eb] hover:shadow-[0_12px_28px_rgba(59,130,246,0.5)]"
            >
              <Map className="h-4 w-4" />
              Xem tất cả trên bản đồ
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={sectionVariants}
        className="bg-[#f0f9ff] px-5 py-20 sm:px-8 lg:px-10 dark:bg-[#0a1628]"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[1.5px] text-[#3b82f6]">HƯỚNG DẪN</p>
            <h2 className="text-[32px] font-black tracking-tight text-slate-900 dark:text-white sm:text-[40px]">
              Khám phá ẩm thực dễ dàng chỉ với 3 bước
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
              Từ tìm kiếm đến thưởng thức — mọi thứ đều thật đơn giản.
            </p>
          </div>
          <motion.div
            variants={containerVariants}
            className="grid gap-6 md:grid-cols-3"
          >
            {[
              {
                step: '1',
                title: 'Tìm quán gần bạn',
                text: 'Mở bản đồ, bật định vị GPS, và xem ngay các quán ăn nằm trong bán kính 2 km xung quanh bạn. Lọc theo loại món, giá cả hoặc đánh giá.',
                icon: <Map className="h-7 w-7" />,
              },
              {
                step: '2',
                title: 'Xem menu & đánh giá',
                text: 'Xem đầy đủ thực đơn, giá cả, hình ảnh món ăn, giờ hoạt động và hàng ngàn đánh giá thực tế từ cộng đồng.',
                icon: <List className="h-7 w-7" />,
                active: true,
                huyhieu: 'Phổ biến nhất',
              },
              {
                step: '3',
                title: 'Chỉ đường & thưởng thức',
                text: 'Bấm "Chỉ đường" để mở ứng dụng bản đồ, tìm đường đến quán một cách dễ dàng và bắt đầu thưởng thức.',
                icon: <Navigation className="h-7 w-7" />,
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={cardVariants}
                className={`relative flex flex-col items-center rounded-[24px] bg-white px-6 py-10 text-center shadow-[0_4px_24px_rgba(0,0,0,0.02)] transition hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:bg-[#111a2e] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.5)] ${
                  (item as { active?: boolean }).active ? 'border border-[#3b82f6]' : 'border border-transparent'
                }`}
              >
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#3b82f6] text-[15px] font-bold text-white shadow-sm">
                  {item.step}
                </div>
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[18px] bg-[#e0f2fe] text-[3rem] dark:bg-[#1e3a8a]/50">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-[18px] font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">{item.text}</p>
                {(item as { huyhieu?: string }).huyhieu && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#3b82f6] px-4 py-1 text-[11px] font-bold text-white shadow-sm">
                    {(item as { huyhieu: string }).huyhieu}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <ContributionSection />
    </div>
  );
}
