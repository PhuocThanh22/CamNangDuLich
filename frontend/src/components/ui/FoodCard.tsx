'use client';

import { ArrowRight, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface FoodCardItem {
  id?: number | string;
  ten: string;
  hinh: string;
  trangthai: string;
  danhgia: string;
  khoangcach: string;
  gia: string;
}

interface FoodCardProps {
  item: FoodCardItem;
}

export default function FoodCard({ item }: FoodCardProps) {
  const router = useRouter();

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => router.push(`/place/${item.id || encodeURIComponent(item.ten)}`)}
      className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.07)] transition-shadow hover:shadow-[0_16px_40px_rgba(0,0,0,0.13)]"
    >
      <div className="relative h-[200px] overflow-hidden">
        <img
          src={item.hinh}
          alt={item.ten}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-108"
          style={{ transitionDuration: '500ms' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute right-3 top-3">
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              item.trangthai === 'Đang mở'
                ? 'bg-green-500/90 text-white'
                : 'bg-slate-700/80 text-white'
            }`}
          >
            ● {item.trangthai}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1.5 text-[16px] font-bold leading-snug text-slate-900">{item.ten}</h3>
        <div className="mb-2 flex items-center gap-1.5 text-[13px] text-slate-500">
          <span className="text-amber-400">★★★★★</span>
          <span>{item.danhgia}</span>
        </div>
        <div className="mb-4 flex items-center gap-3 text-[12px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {item.khoangcach}
          </span>
          <span className="font-semibold text-orange-500">{item.gia}</span>
        </div>
        <button
          type="button"
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#eff6ff] py-2.5 text-[13px] font-semibold text-[#3b82f6] transition group-hover:bg-[#3b82f6] group-hover:text-white"
        >
          Xem chi tiết <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.article>
  );
}
