'use client';

import { useState } from 'react';
import { Search, MapPin, Navigation, Star, Map } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { heroImage } from '@/utils/constants';
import type { ReactNode } from 'react';

interface Stat {
  label: string;
  value: string;
  icon: ReactNode;
}

export default function Hero() {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');

  const { scrollY } = useScroll();
  const bgScale = useTransform(scrollY, [0, 600], [1, 1.12]);
  const bgOpacity = useTransform(scrollY, [0, 500], [1, 0.35]);
  const contentY = useTransform(scrollY, [0, 500], [0, -60]);
  const contentOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  const stats: Stat[] = [
    { label: 'địa điểm', value: '2,400+', icon: <MapPin className="h-5 w-5" /> },
    { label: 'đánh giá', value: '18,000+', icon: <Star className="h-5 w-5 text-amber-400" /> },
    { label: 'tỉnh thành', value: '63', icon: <Map className="h-5 w-5" /> },
  ];

  const handleSearch = () => {
    const q = searchValue.trim();
    router.push(q ? `/map?search=${encodeURIComponent(q)}` : '/map');
  };

  return (
    <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale: bgScale, opacity: bgOpacity }}>
        <img
          src={heroImage}
          alt="Ẩm thực đường phố Việt Nam"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a]/75 via-[#0f172a]/60 to-[#0f172a]/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e40af]/20 via-transparent to-[#0ea5e9]/10" />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 flex w-full flex-col items-center justify-center px-5 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-md"
        >
          <span className="flex h-2 w-2 rounded-full bg-[#4ade80]">
            <span className="h-2 w-2 animate-ping rounded-full bg-[#4ade80] opacity-75" />
          </span>
          <MapPin className="h-3.5 w-3.5" />
          Khám phá ẩm thực đường phố gần bạn
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-5 text-[32px] font-black leading-[1.1] tracking-[-0.03em] text-white sm:text-[56px] lg:text-[68px]"
        >
          Khám phá ẩm thực
          <br />
          <span className="bg-gradient-to-r from-[#60a5fa] to-[#93c5fd] bg-clip-text text-transparent">
            đường phố Việt Nam
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-9 max-w-lg text-[16px] leading-[1.7] text-white/75 sm:text-[18px]"
        >
          Tìm quán ăn ngon gần bạn, xem đánh giá,
          menu, giá cả và chỉ đường trực tiếp trên bản đồ.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]"
        >
          <div className="flex items-center gap-2 p-2">
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Bạn muốn ăn gì? Ví dụ: Bánh mì, Phở, Hải sản..."
                className="w-full bg-transparent text-[14px] text-slate-800 outline-none placeholder:text-slate-400"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button
              type="button"
              onClick={() => router.push('/map')}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)] transition hover:bg-[#2563eb]"
            >
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">Gần tôi</span>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            type="button"
            onClick={() => router.push('/map')}
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#3b82f6] px-6 py-3 text-[14px] font-bold text-white shadow-[0_8px_24px_rgba(59,130,246,0.45)] transition hover:bg-[#2563eb] hover:shadow-[0_12px_28px_rgba(59,130,246,0.5)]"
          >
            <Map className="h-4 w-4" /> Khám phá bản đồ
          </button>
          <button
            type="button"
            onClick={() => router.push('/add')}
            className="inline-flex items-center gap-2 rounded-[12px] border border-white/25 bg-white/10 px-6 py-3 text-[14px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            + Thêm địa điểm
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="absolute bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0f172a]/80 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-center divide-x divide-white/15 py-3 sm:py-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2 px-3 sm:gap-2.5 sm:px-14">
              <span className="text-blue-300">{stat.icon}</span>
              <div>
                <span className="text-[13px] font-bold text-white sm:text-[15px]">{stat.value}</span>
                <span className="ml-1 text-[11px] text-white/60 sm:ml-1.5 sm:text-[13px]">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
