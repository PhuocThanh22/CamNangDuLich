'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import FoodGlobe from './FoodGlobe';
import {
  Search, X, MapPin, Clock, Star, Navigation, Loader2,
  LocateFixed, Map, Filter, ChevronDown, Moon, Satellite, Leaf,
  Utensils, Coffee, Beer, Sandwich, Globe2,
} from 'lucide-react';
import { placeService } from '@/services/placeService';
import { getStatusFromHours } from '@/lib/utils';

interface MapTile {
  id: string;
  label: string;
  icon: React.ReactNode;
  url: string;
  attr: string;
}

const MAP_TILES: MapTile[] = [
  {
    id: 'osm', label: 'Mặc định', icon: <Leaf className="h-4 w-4" />,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors',
  },
  {
    id: 'smooth', label: 'Sáng', icon: <Map className="h-4 w-4" />,
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attr: '© OpenStreetMap contributors',
  },
  {
    id: 'dark', label: 'Tối', icon: <Moon className="h-4 w-4" />,
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attr: '© OpenStreetMap contributors © CARTO',
  },
  {
    id: 'satellite', label: 'Vệ tinh', icon: <Satellite className="h-4 w-4" />,
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attr: 'Tiles © Esri',
  },
];

const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=70',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=70',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&q=70',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70',
  'https://images.unsplash.com/photo-1544982503-9f984c14501a?w=400&q=70',
  'https://images.unsplash.com/photo-1512152272829-e3139592d56f?w=400&q=70',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=70',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=70',
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=70',
  'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=70',
  'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=400&q=70',
  'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=70',
];

interface VietnamCity {
  ten: string;
  vido: number;
  kinhdo: number;
  lat_min: number;
  lat_max: number;
  lng_min: number;
  lng_max: number;
  dac_san: string;
  img: string;
}

const VIETNAM_CITIES: VietnamCity[] = [
  { ten: 'Hà Nội', vido: 21.028, kinhdo: 105.854, lat_min: 20.97, lat_max: 21.13, lng_min: 105.76, lng_max: 105.92, dac_san: 'Phở', img: FOOD_IMAGES[0] },
  { ten: 'TP.HCM', vido: 10.78, kinhdo: 106.70, lat_min: 10.72, lat_max: 10.85, lng_min: 106.62, lng_max: 106.78, dac_san: 'Cơm tấm', img: FOOD_IMAGES[3] },
  { ten: 'Đà Nẵng', vido: 16.07, kinhdo: 108.22, lat_min: 16.02, lat_max: 16.10, lng_min: 108.18, lng_max: 108.27, dac_san: 'Bánh xèo', img: FOOD_IMAGES[5] },
  { ten: 'Huế', vido: 16.46, kinhdo: 107.59, lat_min: 16.42, lat_max: 16.50, lng_min: 107.54, lng_max: 107.64, dac_san: 'Bún bò', img: FOOD_IMAGES[2] },
  { ten: 'Hội An', vido: 15.88, kinhdo: 108.33, lat_min: 15.86, lat_max: 15.92, lng_min: 108.30, lng_max: 108.38, dac_san: 'Bánh mì', img: FOOD_IMAGES[1] },
  { ten: 'Nha Trang', vido: 12.25, kinhdo: 109.20, lat_min: 12.22, lat_max: 12.28, lng_min: 109.17, lng_max: 109.23, dac_san: 'Hải sản', img: FOOD_IMAGES[6] },
  { ten: 'Đà Lạt', vido: 11.95, kinhdo: 108.44, lat_min: 11.92, lat_max: 11.98, lng_min: 108.40, lng_max: 108.48, dac_san: 'Cà phê', img: FOOD_IMAGES[7] },
  { ten: 'Cần Thơ', vido: 10.04, kinhdo: 105.77, lat_min: 10.00, lat_max: 10.08, lng_min: 105.72, lng_max: 105.82, dac_san: 'Chè', img: FOOD_IMAGES[8] },
  { ten: 'Vũng Tàu', vido: 10.36, kinhdo: 107.08, lat_min: 10.33, lat_max: 10.40, lng_min: 107.05, lng_max: 107.12, dac_san: 'Hải sản', img: FOOD_IMAGES[9] },
  { ten: 'Hải Phòng', vido: 20.85, kinhdo: 106.69, lat_min: 20.82, lat_max: 20.88, lng_min: 106.65, lng_max: 106.73, dac_san: 'Bún cá', img: FOOD_IMAGES[10] },
  { ten: 'Hạ Long', vido: 20.96, kinhdo: 107.10, lat_min: 20.93, lat_max: 21.00, lng_min: 107.05, lng_max: 107.15, dac_san: 'Hải sản', img: FOOD_IMAGES[11] },
  { ten: 'Quy Nhơn', vido: 13.77, kinhdo: 109.23, lat_min: 13.74, lat_max: 13.80, lng_min: 109.19, lng_max: 109.26, dac_san: 'Bánh xèo', img: FOOD_IMAGES[12] },
];

interface Place {
  id: string | number;
  ten: string;
  vido: number;
  kinhdo: number;
  tienich?: string;
  monan: string;
  giohoatdong?: string;
  giomocua?: string;
  dienthoai?: string;
  diachi: string;
  khoangcach?: string;
  hinh: string;
  danhgia: string;
  gia: string;
  trangthai: string;
  ladulieu?: boolean;
  distRaw?: number;
}

interface CityMarker {
  label: string;
  vido: number;
  kinhdo: number;
  img: string;
  monan: string;
  count: number;
  places: Place[];
}

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function computeCityMarkers(placesList: Place[]): CityMarker[] {
  return VIETNAM_CITIES.map((city) => {
    const cityPlaces = placesList.filter(
      (p) =>
        p.vido >= city.lat_min &&
        p.vido <= city.lat_max &&
        p.kinhdo >= city.lng_min &&
        p.kinhdo <= city.lng_max
    );
    const dishCounts: Record<string, number> = {};
    cityPlaces.forEach((p) => {
      const dish = p.monan || p.tienich || 'Ẩm thực';
      dishCounts[dish] = (dishCounts[dish] || 0) + 1;
    });
    const topDish =
      Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      city.dac_san;
    return {
      label: city.ten,
      vido: city.vido,
      kinhdo: city.kinhdo,
      img: city.img,
      monan: topDish,
      count: cityPlaces.length,
      places: cityPlaces.slice(0, 8),
    };
  });
}

function generateDemoPlaces([lat, lng]: [number, number]): Place[] {
  const demos = [
    { ten: 'Phở Hà Nội', monan: 'Phở', tienich: 'an_uong', dlat: 0.002, dlng: 0.003 },
    { ten: 'Bún bò Huế Minh Thuận', monan: 'Bún', tienich: 'an_uong', dlat: -0.003, dlng: 0.001 },
    { ten: 'Bánh mì Như Lan', monan: 'Bánh mì', tienich: 'fast_food', dlat: 0.001, dlng: -0.004 },
    { ten: 'Cà phê Trung Nguyên', monan: 'Cà phê', tienich: 'cafe', dlat: -0.001, dlng: 0.005 },
    { ten: 'Cơm tấm Sài Gòn', monan: 'Cơm', tienich: 'an_uong', dlat: 0.005, dlng: -0.002 },
    { ten: 'Bún chả Hương Liên', monan: 'Bún', tienich: 'an_uong', dlat: -0.004, dlng: -0.003 },
    { ten: 'Quán ăn Thanh Hương', monan: 'Đặc sản', tienich: 'an_uong', dlat: 0.003, dlng: 0.006 },
    { ten: 'Lẩu thái Mama', monan: 'Lẩu', tienich: 'an_uong', dlat: -0.006, dlng: 0.002 },
    { ten: 'Bánh xèo Mười Xiềm', monan: 'Bánh xèo', tienich: 'an_uong', dlat: 0.007, dlng: -0.001 },
    { ten: 'The Coffee House', monan: 'Cà phê', tienich: 'cafe', dlat: -0.002, dlng: -0.006 },
    { ten: 'Hải sản Cây Thông', monan: 'Hải sản', tienich: 'an_uong', dlat: 0.006, dlng: 0.004 },
    { ten: 'Gỏi cuốn Sài Gòn', monan: 'Đặc sản', tienich: 'an_uong', dlat: -0.005, dlng: -0.001 },
  ];
  return demos.map((d, i) => {
    const dist = Math.sqrt(d.dlat ** 2 + d.dlng ** 2) * 111;
    return {
      id: `demo-${i}`, ten: d.ten, vido: lat + d.dlat, kinhdo: lng + d.dlng,
      tienich: d.tienich, monan: d.monan, giomocua: '06:00 – 22:00',
      dienthoai: '', diachi: 'Gần vị trí của bạn',
      khoangcach: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
      distRaw: dist,
      hinh: FOOD_IMAGES[i % FOOD_IMAGES.length],
      danhgia: (4.0 + Math.random() * 0.9).toFixed(1),
      gia: d.tienich === 'cafe' ? '25k–80k đ' : d.tienich === 'fast_food' ? '20k–50k đ' : '30k–120k đ',
      trangthai: 'Đang mở', ladulieu: true,
    };
  });
}

function makeFoodIcon(isSelected = false): L.DivIcon {
  const size = isSelected ? 50 : 40;
  const color = isSelected ? '#2563eb' : '#3b82f6';
  return new L.DivIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;
        filter:drop-shadow(0 ${isSelected ? 6 : 3}px ${isSelected ? 14 : 8}px rgba(59,130,246,${isSelected ? 0.6 : 0.35}));
        transition:all 0.25s;">
        <div style="
          width:${size}px;height:${size}px;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          background:${isSelected ? 'linear-gradient(135deg,#2563eb,#3b82f6)' : color};
          border:${isSelected ? 4 : 3}px solid white;
          display:flex;align-items:center;justify-content:center;
          ${isSelected ? `box-shadow:0 0 0 6px rgba(59,130,246,0.3);` : ''}
        ">
          <span style="transform:rotate(45deg); display: flex; align-items: center; justify-content: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 20 : 16}" height="${isSelected ? 20 : 16}" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
          </span>
        </div>
        <div style="width:${isSelected ? 8 : 6}px;height:${isSelected ? 8 : 6}px;
          background:${color};border-radius:50%;margin-top:2px;
          ${isSelected ? 'box-shadow:0 0 6px rgba(59,130,246,0.6);' : ''}"></div>
      </div>`,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 12)],
  });
}

function makeUserIcon(): L.DivIcon {
  return new L.DivIcon({
    className: '',
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.2);animation:ping 1.5s ease-in-out infinite;"></div>
        <div style="position:absolute;inset:2px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5);"></div>
        <style>@keyframes ping{0%,100%{transform:scale(1);opacity:0.8}50%{transform:scale(2);opacity:0}}</style>
      </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function FlyToSelected({ place, zoom }: { place: { vido?: number; kinhdo?: number } | null; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (place?.vido && place?.kinhdo) {
      map.setView([place.vido, place.kinhdo], zoom || map.getZoom(), { animate: true });
    }
  }, [place]);
  return null;
}

function ZoomTracker({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoom: () => onZoomChange(map.getZoom()),
    zoomend: () => onZoomChange(map.getZoom()),
    move: () => onZoomChange(map.getZoom()),
  });
  return null;
}

function MapStyleSwitcher({ activeTile, onChangeTile }: { activeTile: string; onChangeTile: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const active = MAP_TILES.find((t) => t.id === activeTile) || MAP_TILES[0];
  return (
    <div className="absolute right-4 top-4 z-[1000]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-slate-700 shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111a2e] dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <span className="text-slate-500 dark:text-slate-400">{active.icon}</span>
        <span>{active.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" />
      </button>
      {open && (
        <div className="absolute right-0 top-12 min-w-[170px] overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl dark:border-slate-700 dark:bg-[#111a2e]">
          {MAP_TILES.map((tile) => (
            <button
              key={tile.id}
              onClick={() => { onChangeTile(tile.id); setOpen(false); }}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-[13px] font-medium transition hover:bg-slate-50 dark:hover:bg-slate-800 ${activeTile === tile.id ? 'text-[#3b82f6]' : 'text-slate-600 dark:text-slate-300'}`}
            >
              <span className="text-slate-400 dark:text-slate-500">{tile.icon}</span>
              {tile.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface GlobeSpotInfo {
  label: string;
  vido: number;
  kinhdo: number;
  img: string;
  monan: string;
  count: number;
  places: Place[];
  index?: number;
  nearby?: Place[];
}

export default function MapClient() {
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([21.028, 105.854]);
  const [mapZoom, setMapZoom] = useState(13);
  const [flyToPlace, setFlyToPlace] = useState<{ vido?: number; kinhdo?: number } | null>(null);
  const initialCenterRef = useRef<[number, number]>([21.028, 105.854]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTile, setActiveTile] = useState('osm');
  const [isGlobeMode, setIsGlobeMode] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [locating, setLocating] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [circleRadius, setCircleRadius] = useState(2);
  const [committedRadius, setCommittedRadius] = useState(2);
  const [showRadius, setShowRadius] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    rating: 'all',
    status: 'all',
  });
  const [globeSpotInfo, setGlobeSpotInfo] = useState<GlobeSpotInfo | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [urlFilter, setUrlFilter] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    const radius = params.get('radius');
    if (cat) {
      setFilters((f) => ({ ...f, category: cat }));
      setUrlFilter(true);
    }
    const r = radius ? parseFloat(radius) : NaN;
    if (!Number.isNaN(r) && r > 0) {
      setCircleRadius(r);
      setCommittedRadius(r);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const placeId = params.get('place_id');
    placeService.getAll({})
      .then((res) => {
        const data = res.data as Record<string, unknown>[];
        if (data?.length) {
          const mapped = data.map((p, i) => ({
            id: (p.id as string) || `api-${i}`,
            ten: p.ten as string,
            vido: p.vido as number,
            kinhdo: p.kinhdo as number,
            tienich: (p.tienich as string) || 'an_uong',
            monan: (p.monan as string) || (p.phanloai as string) || 'Ẩm thực',
            giomocua: (p.giomocua as string) || undefined,
            giohoatdong: (p.giohoatdong as string) || (p.giomocua as string) || '',
            dienthoai: (p.dienthoai as string) || '',
            diachi: (p.diachi as string) || '',
            khoangcach: (p.khoangcach as string) || '',
            hinh: (p.hinh as string) || FOOD_IMAGES[i % FOOD_IMAGES.length],
            danhgia: (p.danhgia as string) || '',
            gia: (p.gia as string) || '30k–120k đ',
            trangthai: (p.trangthai as string) || 'Đang mở',
            ladulieu: (p.ladulieu as boolean) || false,
          }));
          setPlaces(mapped);
          if (placeId) {
            const target = mapped.find((pl) => String(pl.id) === placeId);
            if (target) {
              setSelectedPlace(target);
              setFlyToPlace(target);
              setMapCenter([target.vido, target.kinhdo]);
              initialCenterRef.current = [target.vido, target.kinhdo];
            }
          }
          return;
        }
        setPlaces(generateDemoPlaces(mapCenter));
      })
      .catch(() => setPlaces(generateDemoPlaces(mapCenter)))
      .finally(() => setMapLoading(false));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          initialCenterRef.current = [latitude, longitude];
          setMapCenter([latitude, longitude]);
          setLocationError(null);
        },
        (err) => {
          if (err.code === 1) setLocationError('Vui lòng cho phép truy cập vị trí trong trình duyệt');
          else if (err.code === 2) setLocationError('Không thể xác định vị trí. Vui lòng thử lại');
          else if (err.code === 3) setLocationError('Yêu cầu định vị đã hết thời gian. Thử lại sau');
          else setLocationError('Không thể định vị vị trí của bạn');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
      );
    } else {
      setLocationError('Trình duyệt không hỗ trợ định vị');
    }
  }, []);

  const cityMarkers = useMemo(() => computeCityMarkers(places), [places]);

  const handleLocate = useCallback(() => {
    setLocating(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          initialCenterRef.current = [latitude, longitude];
          setMapCenter([latitude, longitude]);
          setFlyToPlace({ vido: latitude, kinhdo: longitude });
          setLocating(false);
          setLocationError(null);
          setIsGlobeMode(false);
          const isDemo = places.length > 0 && places[0].id?.toString().startsWith('demo-');
          if (isDemo) {
            setPlaces(generateDemoPlaces([latitude, longitude]));
          }
        },
        (err) => {
          setLocating(false);
          if (err.code === 1) setLocationError('Vui lòng cho phép truy cập vị trí trong trình duyệt');
          else if (err.code === 2) setLocationError('Không thể xác định vị trí. Vui lòng thử lại');
          else if (err.code === 3) setLocationError('Yêu cầu định vị đã hết thời gian. Thử lại sau');
          else setLocationError('Không thể định vị vị trí của bạn');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
      );
    } else {
      setLocating(false);
      setLocationError('Trình duyệt không hỗ trợ định vị');
    }
  }, [places]);

  function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const filteredPlaces = useMemo(() => {
    const valid = places.filter((p) => p.vido != null && p.kinhdo != null);
    if (!searchQuery.trim()) return valid;
    const q = normalizeText(searchQuery.trim());
    return valid.filter(
      (p) =>
        normalizeText(p.ten || '').includes(q) ||
        normalizeText(p.monan || '').includes(q) ||
        normalizeText(p.diachi || '').includes(q)
    );
  }, [searchQuery, places]);

  const categories = useMemo(() => {
    const cats = new Set(places.filter((p) => p.monan).map((p) => p.monan));
    return ['Tất cả', ...Array.from(cats)];
  }, [places]);

  const nearbyPlaces = useMemo(() => {
    let result = filteredPlaces;
    const isSearching = searchQuery.trim().length > 0;
    if (userLocation && !isSearching) {
      result = result
        .map((p) => ({
          ...p,
          distRaw: getDistance(
            userLocation[0],
            userLocation[1],
            p.vido,
            p.kinhdo
          ),
        }))
        .filter((p) => p.distRaw <= committedRadius)
        .sort((a, b) => a.distRaw! - b.distRaw!);
    }
    if (!isSearching && filters.category !== 'all') {
      result = result.filter(
        (p) =>
          p.monan === filters.category || p.tienich === filters.category
      );
    }
    if (filters.rating === '4') {
      result = result.filter((p) => parseFloat(p.danhgia) >= 4);
    } else if (filters.rating === '3') {
      result = result.filter((p) => parseFloat(p.danhgia) >= 3);
    }
    if (filters.status === 'open') {
      result = result.filter((p) => getStatusFromHours(p.giohoatdong || p.giomocua) === 'Đang mở');
    }
    return result;
  }, [filteredPlaces, userLocation, committedRadius, filters, searchQuery]);

  const tileUrl = MAP_TILES.find((t) => t.id === activeTile)?.url || MAP_TILES[0].url;
  const tileAttr = MAP_TILES.find((t) => t.id === activeTile)?.attr || MAP_TILES[0].attr;

  return (
    <div className="absolute inset-0">
      {isGlobeMode ? (
        <div className="absolute inset-0 z-10" style={{ background: 'radial-gradient(ellipse at center, #0b1f24 0%, #05070d 100%)' }}>
          <FoodGlobe
            spots={cityMarkers}
            onSelect={(spot) => {
              const s = spot as CityMarker;
              setGlobeSpotInfo({ ...s, index: cityMarkers.findIndex((c) => c.label === s.label), nearby: s.places });
            }}
          />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
            <p className="text-[11px] text-white/30 tracking-widest uppercase">Kéo để xoay · Nhấp vào ảnh để xem</p>
          </div>

          <button
            onClick={() => setIsGlobeMode(false)}
            className="absolute left-4 top-4 z-10 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-[13px] font-semibold text-white/70 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
          >
            <Map className="mr-2 inline h-4 w-4" />
            Bản đồ
          </button>

          <AnimatePresence>
            {globeSpotInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[90vw] max-w-[320px] rounded-2xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden"
              >
                <div className="flex gap-3 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                    <img src={globeSpotInfo.img} alt={globeSpotInfo.label} className="h-full w-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-bold text-white">{globeSpotInfo.label}</h3>
                      <button onClick={() => setGlobeSpotInfo(null)} className="text-white/40 hover:text-white/80">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-[12px] text-white/50">Món đặc sản: {globeSpotInfo.monan} · {globeSpotInfo.count} quán</p>
                    <button
                      onClick={() => {
                        setIsGlobeMode(false);
                        setMapCenter([globeSpotInfo.vido, globeSpotInfo.kinhdo]);
                        setFlyToPlace({ vido: globeSpotInfo.vido, kinhdo: globeSpotInfo.kinhdo });
                        setGlobeSpotInfo(null);
                      }}
                      className="mt-2 rounded-lg bg-blue-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-600"
                    >
                      <MapPin className="mr-1 inline h-3 w-3" />Xem trên bản đồ
                    </button>
                  </div>
                </div>
                {(globeSpotInfo.nearby ?? []).length > 0 && (
                  <>
                    <div className="border-t border-white/10 px-4 py-2">
                      <p className="text-[11px] font-semibold text-white/40 uppercase tracking-wider">Quán ăn gần đây</p>
                    </div>
                    <div className="max-h-32 overflow-y-auto px-4 pb-3 space-y-1.5">
                      {(globeSpotInfo.nearby ?? []).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPlace(p);
                            setIsGlobeMode(false);
                            setFlyToPlace(p);
                            setGlobeSpotInfo(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-left transition hover:bg-white/10"
                        >
                          <img src={p.hinh} alt={p.ten} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-medium text-white">{p.ten}</p>
                            <p className="text-[11px] text-white/40">{p.monan}{p.danhgia ? ` · ★ ${p.danhgia}` : ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <div className="relative h-full w-full">
          {/* Sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.aside
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '-100%', opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="absolute left-0 top-0 z-[1000] flex h-full w-[85vw] max-w-[320px] flex-col bg-white shadow-xl dark:bg-[#111a2e]"
              >
                {/* Search header */}
                <div className="border-b border-slate-100 p-4 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="flex flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800/50">
                      <Search className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm địa điểm..."
                        className="w-full bg-transparent text-[13px] text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200 dark:placeholder:text-slate-500"
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')}>
                          <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setShowSidebar(false)}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={handleLocate}
                      disabled={locating}
                      className="flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-60"
                    >
                      {locating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LocateFixed className="h-3.5 w-3.5" />}
                      Định vị
                    </button>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-semibold transition ${showFilters ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                    >
                      <Filter className="h-3.5 w-3.5" />
                      Bộ lọc
                    </button>
                    <button
                      onClick={() => setIsGlobeMode(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Globe2 className="h-3.5 w-3.5" />
                      Globe
                    </button>
                  </div>

                  {/* Location error */}
                  {locationError && (
                    <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-[12px] text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {locationError}
                    </div>
                  )}

                  {/* Radius control */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="shrink-0 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      <MapPin className="mr-0.5 inline h-3 w-3" />
                      {circleRadius}km
                    </span>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={circleRadius}
                      disabled={!userLocation}
                      onChange={(e) => setCircleRadius(parseFloat(e.target.value))}
                      onMouseUp={() => setCommittedRadius(circleRadius)}
                      onTouchEnd={() => setCommittedRadius(circleRadius)}
                      onKeyUp={() => setCommittedRadius(circleRadius)}
                      className="flex-1 accent-blue-500 disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                    <button
                      onClick={() => setShowRadius(!showRadius)}
                      disabled={!userLocation}
                      className={`flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold transition ${
                        !userLocation
                          ? 'bg-slate-50 text-slate-300 cursor-not-allowed dark:bg-slate-800/50 dark:text-slate-500'
                          : showRadius
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}
                      title={showRadius ? 'Ẩn vùng bán kính' : 'Hiện vùng bán kính'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                    </button>
                  </div>
                </div>

                {/* Filter panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-slate-100 dark:border-slate-700"
                    >
                      <div className="space-y-3 px-4 py-3">
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                            Phân loại
                          </label>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {categories.map((cat) => (
                              <button
                                key={cat}
                                onClick={() =>
                                  setFilters((f) => ({
                                    ...f,
                                    category:
                                      cat === 'Tất cả' ? 'all' : cat,
                                  }))
                                }
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                                  (cat === 'Tất cả' &&
                                    filters.category === 'all') ||
                                  filters.category === cat
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                            Đánh giá
                          </label>
                          <div className="mt-1 flex gap-1.5">
                            {[
                              { value: 'all', label: 'Tất cả' },
                              { value: '4', label: '4+' },
                              { value: '3', label: '3+' },
                            ].map((r) => (
                              <button
                                key={r.value}
                                onClick={() =>
                                  setFilters((f) => ({
                                    ...f,
                                    rating: r.value,
                                  }))
                                }
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                                  filters.rating === r.value
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                              >
                                {r.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">
                            Trạng thái
                          </label>
                          <div className="mt-1 flex gap-1.5">
                            {[
                              { value: 'all', label: 'Tất cả' },
                              { value: 'open', label: 'Đang mở' },
                            ].map((s) => (
                              <button
                                key={s.value}
                                onClick={() =>
                                  setFilters((f) => ({
                                    ...f,
                                    status: s.value,
                                  }))
                                }
                                className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition ${
                                  filters.status === s.value
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                                }`}
                              >
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Places list */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {nearbyPlaces.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="mb-3 h-10 w-10 text-slate-300 dark:text-slate-500" />
                      <p className="text-[14px] font-medium text-slate-500 dark:text-slate-400">
                        {searchQuery.trim()
                          ? 'Không tìm thấy địa điểm phù hợp'
                          : userLocation
                            ? 'Không có quán ăn nào trong bán kính này'
                            : 'Hãy định vị vị trí của bạn'}
                      </p>
                      <p className="text-[12px] text-slate-400 dark:text-slate-500">
                        {searchQuery.trim()
                          ? 'Thử từ khóa khác, ví dụ: tên quán, món ăn hoặc địa chỉ'
                          : userLocation
                            ? 'Thử tăng bán kính tìm kiếm'
                            : 'Nhấn "Định vị" để xem quán ăn gần bạn'}
                      </p>
                    </div>
                  ) : (
                    nearbyPlaces.map((place) => (
                      <button
                        key={place.id}
                        onClick={() => {
                          setSelectedPlace(place);
                          setFlyToPlace(place);
                        }}
                        className={`w-full rounded-xl p-3 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800 ${selectedPlace?.id === place.id ? 'bg-blue-50 ring-1 ring-blue-200 dark:bg-blue-900/40 dark:ring-blue-900' : ''}`}
                      >
                        <div className="flex gap-3">
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                            <img src={place.hinh} alt={place.ten} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-[12px] font-bold text-slate-900 dark:text-white">{place.ten}</h3>
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                                getStatusFromHours(place.giohoatdong || place.giomocua) === 'Đang mở'
                                  ? 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400'
                                  : 'bg-red-50 text-red-500 dark:bg-red-900/40 dark:text-red-400'
                              }`}>
                                {getStatusFromHours(place.giohoatdong || place.giomocua)}
                              </span>
                            </div>
                            <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{place.monan}</span>
                              {place.danhgia && <span className="text-amber-400">★ {place.danhgia}</span>}
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {place.distRaw != null
                                  ? place.distRaw < 1
                                    ? `${Math.round(place.distRaw * 1000)} m`
                                    : `${place.distRaw.toFixed(1)} km`
                                  : place.khoangcach}
                              </span>
                              <span className="font-medium text-orange-500">{place.gia}</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {/* Bottom info */}
                <div className="border-t border-slate-100 p-3 text-center text-[11px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
                  {userLocation
                    ? `${nearbyPlaces.length} quán ăn trong bán kính ${committedRadius}km`
                    : `${nearbyPlaces.length} địa điểm được tìm thấy`}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Map area */}
          <div className="absolute inset-0">
            {/* Open sidebar button (only when hidden) */}
            {!showSidebar && (
              <button
                onClick={() => setShowSidebar(true)}
                className="absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-semibold text-slate-700 shadow-lg transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#111a2e] dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Search className="h-4 w-4" />
                Tìm kiếm
              </button>
            )}

            <MapStyleSwitcher activeTile={activeTile} onChangeTile={setActiveTile} />

            {/* Active filter banner */}
            {(filters.category !== 'all' || urlFilter) && (
              <div className="absolute left-1/2 top-4 z-[1000] flex max-w-[92vw] -translate-x-1/2 items-center gap-3 rounded-xl border border-blue-100 bg-white px-4 py-2.5 shadow-lg dark:border-blue-900/40 dark:bg-[#111a2e]">
                <div className="truncate text-[12px] text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Đang lọc: {filters.category}</span>
                  {urlFilter && <span> · trong bán kính {committedRadius} km</span>}
                </div>
                <button
                  onClick={() => {
                    setFilters((f) => ({ ...f, category: 'all' }));
                    setUrlFilter(false);
                    setCircleRadius(2);
                    setCommittedRadius(2);
                  }}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <X className="h-3 w-3" /> Bỏ lọc
                </button>
              </div>
            )}

            {/* Leaflet Map */}
              <MapContainer
                  center={initialCenterRef.current}
                  zoom={mapZoom}
                  zoomControl={false}
                  style={{ width: '100%', height: '100%' }}
                  className="z-0"
                >
                  <ZoomControl position="bottomright" />
                  <FlyToSelected place={flyToPlace} zoom={16} />
                  <ZoomTracker onZoomChange={(z) => setMapZoom(z)} />

              <TileLayer url={tileUrl} attribution={tileAttr} />

              {userLocation && (
                <Marker position={userLocation} icon={makeUserIcon()} />
              )}

              {userLocation && showRadius && (
                <Circle
                  center={userLocation}
                  radius={committedRadius * 1000}
                  pathOptions={{
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.08,
                    weight: 2,
                    dashArray: '8 4',
                    opacity: 0.5,
                  }}
                />
              )}

              <MarkerClusterGroup chunkedLoading>
                {filteredPlaces.map((place) => (
                  <Marker
                    key={place.id}
                    position={[place.vido, place.kinhdo]}
                    icon={makeFoodIcon(selectedPlace?.id === place.id)}
                    eventHandlers={{
                      click: () => {
                        setSelectedPlace(place);
                        setFlyToPlace(place);
                      },
                    }}
                  />
                ))}
              </MarkerClusterGroup>
            </MapContainer>

            {/* Selected place popup */}
            <AnimatePresence>
              {selectedPlace && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-4 left-4 right-4 z-[1000] mx-auto max-w-md rounded-2xl bg-white p-4 shadow-2xl dark:bg-[#111a2e]"
                >
                  <div className="flex gap-3">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <img src={selectedPlace.hinh} alt={selectedPlace.ten} className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[15px] font-bold text-slate-900 dark:text-white">{selectedPlace.ten}</h3>
                        <button onClick={() => setSelectedPlace(null)}>
                          <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                        </button>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-600 dark:bg-blue-900/40 dark:text-blue-300">{selectedPlace.monan}</span>
                        {selectedPlace.danhgia && <span className="text-amber-400">★ {selectedPlace.danhgia}</span>}
                      </div>
                      <div className="mt-2 flex items-center gap-3 text-[12px] text-slate-400 dark:text-slate-500">
                        <span>
                          <MapPin className="mr-0.5 inline h-3 w-3" />
                          {selectedPlace.distRaw != null
                            ? selectedPlace.distRaw < 1
                              ? `${Math.round(selectedPlace.distRaw * 1000)} m`
                              : `${selectedPlace.distRaw.toFixed(1)} km`
                            : selectedPlace.khoangcach}
                        </span>
                        <span className="font-medium text-orange-500">{selectedPlace.gia}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const dest = `${selectedPlace.vido},${selectedPlace.kinhdo}`;
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, '_blank');
                      }}
                      className="flex-1 rounded-xl bg-[#3b82f6] py-2 text-[12px] font-bold text-white transition hover:bg-[#2563eb]"
                    >
                      <Navigation className="mr-1 inline h-3.5 w-3.5" />Chỉ đường
                    </button>
                    <button
                      onClick={() => {
                        const id = selectedPlace.id?.toString().replace('demo-', '');
                        if (id) router.push(`/place/${id}`);
                      }}
                      className="flex-1 rounded-xl border border-slate-200 py-2 text-[12px] font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
