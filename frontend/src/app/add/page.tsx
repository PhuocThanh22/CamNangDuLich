'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Camera, Clock3, Send, Info, MapPin, Check, Loader2, ArrowLeft, Upload, X, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';
import { getUser } from '@/services/authService';
import { placeService } from '@/services/placeService';
import { provinces } from '@/utils/constants';
import type { User } from '@/services/authService';

import 'leaflet/dist/leaflet.css';

const MapPicker = dynamic(() => import('@/components/map/MapPicker'), { ssr: false });

export default function AddPlacePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [ten, setTen] = useState('');
  const [phanloai, setPhanloai] = useState('');
  const [gia, setGia] = useState('');
  const [tinh, setTinh] = useState('');
  const [diachi, setDiachi] = useState('');
  const [mota, setMota] = useState('');
  const [gioMo, setGioMo] = useState('06');
  const [phutMo, setPhutMo] = useState('00');
  const [gioDong, setGioDong] = useState('22');
  const [phutDong, setPhutDong] = useState('00');
  const [hinhs, setHinhs] = useState<string[]>([]);
  const [vido, setVido] = useState<number | null>(null);
  const [kinhdo, setKinhdo] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUser(u);
    setLoading(false);
  }, []);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - hinhs.length;
    if (remaining <= 0) return;
    const toProcess = files.slice(0, remaining);
    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setHinhs((prev) => {
          if (prev.length >= 10) return prev;
          return [...prev, event.target?.result as string];
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const gioMoStr = `${gioMo}:${phutMo}`;
      const gioDongStr = `${gioDong}:${phutDong}`;
      const giohoatdong = `${gioMoStr} – ${gioDongStr}`;
      const res = await placeService.create({
        ten,
        phanloai,
        gia: gia || null,
        diachi: diachi || null,
        tinh: tinh || null,
        mota: mota || null,
        giohoatdong: giohoatdong || null,
        giomocua: gioMoStr || null,
        hinh: hinhs[0] || null,
        vido: vido || null,
        kinhdo: kinhdo || null,
      });
      const createdPlace = res.data;
      for (let i = 1; i < hinhs.length; i++) {
        try {
          await placeService.createPlaceImage(createdPlace.id, { url: hinhs[i] });
        } catch { }
      }
      setSuccess('Địa điểm đã được gửi để xét duyệt!');
      setTen('');
      setPhanloai('');
      setGia('');
      setTinh('');
      setDiachi('');
      setMota('');
      setGioMo('06');
      setPhutMo('00');
      setGioDong('22');
      setPhutDong('00');
      setHinhs([]);
      setVido(null);
      setKinhdo(null);
      setTimeout(() => router.push('/'), 2000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClassName = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/20';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#f8fafc] px-5 py-10 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-[#eff6ff] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          <button
            onClick={() => router.push('/')}
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </button>

          <div className="mx-auto flex max-w-[1120px] flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1 max-w-[740px]">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3b82f6] shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#3b82f6]">Đóng góp cộng đồng</p>
              </div>

              <h1 className="mb-4 text-[30px] font-black tracking-tight text-slate-900 sm:text-[38px]">
                Đóng góp địa điểm ẩm thực mới
              </h1>
              <p className="max-w-[700px] text-[15px] leading-relaxed text-slate-500">
                Chia sẻ những quán ăn ngon bạn biết với cộng đồng. Thông tin sẽ được xét duyệt trước khi hiển thị công khai.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600">{error}</div>
              )}
              {success && (
                <div className="mt-4 rounded-xl bg-green-50 p-3 text-[13px] font-medium text-green-600">{success}</div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-[13px] font-semibold text-slate-800">
                    <span className="mb-2 block">Tên địa điểm *</span>
                    <input
                      value={ten}
                      onChange={(e) => setTen(e.target.value)}
                      className={fieldClassName}
                      placeholder="Ví dụ: Phở Hà Nội Số 1"
                      required
                    />
                  </label>
                  <label className="block text-sm font-semibold text-[#1a202c]">
                    <span className="mb-2 block">Loại món ăn *</span>
                    <select
                      value={phanloai}
                      onChange={(e) => setPhanloai(e.target.value)}
                      className={fieldClassName}
                      required
                    >
                      <option value="">Chọn loại món…</option>
                      <option value="Phở">Phở</option>
                      <option value="Bánh mì">Bánh mì</option>
                      <option value="Bún">Bún</option>
                      <option value="Cơm">Cơm</option>
                      <option value="Hải sản">Hải sản</option>
                      <option value="Cà phê">Cà phê</option>
                    </select>
                  </label>
                </div>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-[#1a202c]">
                    <span className="mb-2 block">Khoảng giá</span>
                    <select
                      value={gia}
                      onChange={(e) => setGia(e.target.value)}
                      className={fieldClassName}
                    >
                      <option value="">Chọn khoảng giá…</option>
                      <option value="Dưới 30k">Dưới 30k</option>
                      <option value="30k–60k">30k–60k</option>
                      <option value="60k–100k">60k–100k</option>
                      <option value="Trên 100k">Trên 100k</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-[#1a202c]">
                    <span className="mb-2 block">Tỉnh/Thành *</span>
                    <select
                      value={tinh}
                      onChange={(e) => setTinh(e.target.value)}
                      className={fieldClassName}
                      required
                    >
                      <option value="">Chọn tỉnh/thành…</option>
                      {provinces.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-semibold text-[#1a202c]">
                    <span className="mb-2 block">Địa chỉ *</span>
                    <input
                      value={diachi}
                      onChange={(e) => setDiachi(e.target.value)}
                      className={fieldClassName}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                      required
                    />
                  </label>
                </div>

                <div className="mt-5">
                  <label className="block text-[13px] font-semibold text-slate-800 mb-2">
                    Vị trí trên bản đồ <span className="text-slate-400 font-normal">(nhấp để chọn)</span>
                  </label>
                  <div className="h-[260px] overflow-hidden rounded-xl border border-slate-200" style={{ isolation: 'isolate', position: 'relative', zIndex: 0 }}>
                    <MapPicker
                      vido={vido}
                      kinhdo={kinhdo}
                      onSelect={(lat, lng) => { setVido(lat); setKinhdo(lng); }}
                    />
                  </div>
                  {vido && kinhdo && (
                    <p className="mt-1.5 text-[12px] text-slate-500">
                      <Navigation className="inline h-3 w-3 mr-0.5" />
                      {vido.toFixed(6)}, {kinhdo.toFixed(6)}
                    </p>
                  )}
                </div>

                <label className="mt-5 block text-[13px] font-semibold text-slate-800">
                  <span className="mb-2 block">Mô tả địa điểm</span>
                  <textarea
                    value={mota}
                    onChange={(e) => setMota(e.target.value)}
                    className={`${fieldClassName} min-h-[100px] resize-none`}
                    placeholder="Mô tả món ăn đặc trưng, không khí quán, điểm nổi bật…"
                  />
                </label>

                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-semibold text-[#1a202c]">
                    <span className="mb-2 block">Giờ mở cửa</span>
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#e2ecf5] bg-[#f7fafc] px-4 py-3">
                      <Clock3 className="h-4 w-4 text-[#a0aec0]" />
                      <select value={gioMo} onChange={(e) => setGioMo(e.target.value)} className="bg-transparent text-[14px] outline-none">
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-slate-400">:</span>
                      <select value={phutMo} onChange={(e) => setPhutMo(e.target.value)} className="bg-transparent text-[14px] outline-none">
                        {['00', '15', '30', '45'].map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </label>
                  <label className="block text-sm font-semibold text-[#1a202c]">
                    <span className="mb-2 block">Giờ đóng cửa</span>
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#e2ecf5] bg-[#f7fafc] px-4 py-3">
                      <Clock3 className="h-4 w-4 text-[#a0aec0]" />
                      <select value={gioDong} onChange={(e) => setGioDong(e.target.value)} className="bg-transparent text-[14px] outline-none">
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-slate-400">:</span>
                      <select value={phutDong} onChange={(e) => setPhutDong(e.target.value)} className="bg-transparent text-[14px] outline-none">
                        {['00', '15', '30', '45'].map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                  </label>
                </div>

                <div className="mt-5">
                  <div className="mb-2 flex items-center gap-2 text-[#3b82f6]">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm font-semibold">Hình ảnh</span>
                    <span className="text-[12px] text-slate-400">({hinhs.length}/10)</span>
                  </div>
                  {hinhs.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-2">
                      {hinhs.map((src, idx) => (
                        <div key={idx} className="relative">
                          <img src={src} alt={`Ảnh ${idx + 1}`} className="h-20 w-20 rounded-lg object-cover" />
                          <button
                            type="button"
                            onClick={() => setHinhs((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {hinhs.length < 10 && (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="cursor-pointer rounded-[10px] border-2 border-dashed border-[#cbd5e1] bg-[#f7fafc] p-4 transition hover:border-[#3b82f6] hover:bg-blue-50"
                    >
                      <p className="text-sm text-[#718096]">
                        <Upload className="mr-1 inline h-4 w-4" />
                        Tải ảnh lên · PNG, JPG, WEBP (tối đa 10MB, còn {10 - hinhs.length} ảnh)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                <div className="mt-5 rounded-xl bg-blue-50 p-4 text-[13px] leading-relaxed text-blue-700">
                  Địa điểm của bạn sẽ được đội ngũ FoodMap Vietnam xét duyệt trong 1–3 ngày làm việc trước khi hiển thị công khai.
                </div>

                <div className="mt-8 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#3b82f6] px-4 py-3.5 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-[#2563eb] disabled:opacity-60"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? 'Đang gửi...' : 'Gửi địa điểm để xét duyệt'}
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="w-full max-w-[320px] space-y-5">
              <div className="rounded-2xl bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
                <h2 className="text-[15px] font-bold text-slate-900">Quy trình đóng góp</h2>
                <div className="mt-5 space-y-4">
                  {[
                    { title: 'Điền thông tin', text: 'Nhập đầy đủ thông tin địa điểm và hình ảnh.' },
                    { title: 'Chờ xét duyệt', text: 'Đội ngũ kiểm duyệt trong 1–3 ngày làm việc.' },
                    { title: 'Địa điểm được duyệt', text: 'Xuất hiện trên bản đồ và bạn nhận điểm đóng góp.', done: true },
                  ].map((step, index) => (
                    <div key={step.title} className="flex gap-3">
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white ${step.done ? 'bg-green-500' : 'bg-[#3b82f6]'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-slate-800">{step.title}</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{step.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-blue-50 p-5">
                <div className="mb-3 flex items-center gap-2 text-[#3b82f6]">
                  <Info className="h-4 w-4" />
                  <h3 className="text-[15px] font-bold">Mẹo để được duyệt nhanh</h3>
                </div>
                <ul className="space-y-2 text-[13px] leading-relaxed text-slate-600">
                  {[
                    'Thêm ít nhất 3 hình ảnh rõ nét',
                    'Điền đầy đủ địa chỉ chi tiết',
                    'Mô tả ít nhất 50 từ về địa điểm',
                    'Thêm giờ mở/đóng cửa chính xác',
                    'Chọn vị trí chính xác trên bản đồ',
                  ].map((tip) => (
                    <li key={tip} className="flex items-start gap-2">
                      <span className="mt-1 text-[#3b82f6]"><Check className="h-3.5 w-3.5" /></span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
