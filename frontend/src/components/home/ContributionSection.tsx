'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Users, MapPin, Star } from 'lucide-react';
import type { ReactNode } from 'react';

interface Stat {
  value: string;
  label: string;
  icon: ReactNode;
}

export default function ContributionSection() {
  const router = useRouter();

  const stats: Stat[] = [
    { value: '12,480+', label: 'Người đóng góp', icon: <Users className="h-5 w-5" /> },
    { value: '2,400+', label: 'Địa điểm đã thêm', icon: <MapPin className="h-5 w-5" /> },
    { value: '18,000+', label: 'Đánh giá được duyệt', icon: <Star className="h-5 w-5 text-amber-400" /> },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#0ea5e9] px-5 py-16 sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[12px] font-medium text-white">
              <span>+</span>
              Bạn biết một quán ăn ngon chưa có trên bản đồ?
            </div>
            <h2 className="mb-4 text-[36px] font-black leading-tight text-white sm:text-[44px]">
              Đóng góp địa điểm
              <br />ẩm thực mới
            </h2>
            <p className="mb-8 max-w-md text-[15px] leading-relaxed text-white/70">
              Giúp cộng đồng khám phá thêm những hương vị tuyệt vời. Thêm địa điểm, upload ảnh, mô tả món ăn — tất cả chỉ trong vài phút.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => router.push('/add')}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-[14px] font-bold text-[#1d4ed8] shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition hover:bg-blue-50 hover:shadow-[0_12px_32px_rgba(0,0,0,0.25)]"
              >
                + Thêm địa điểm ngay
              </button>
              <button
                type="button"
                onClick={() => router.push('/map')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-[14px] font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Khám phá bản đồ
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex flex-col gap-3 lg:w-[320px]"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[22px] font-black text-white">{stat.value}</p>
                  <p className="text-[13px] text-white/60">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
