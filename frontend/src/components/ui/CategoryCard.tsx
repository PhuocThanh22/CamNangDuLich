'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CategoryCardProps {
  title: string;
  count: string;
  icon: ReactNode;
  bg: string;
}

export default function CategoryCard({ title, count, icon, bg }: CategoryCardProps) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -4, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex w-full flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition hover:border-blue-100 hover:shadow-[0_8px_24px_rgba(59,130,246,0.1)] sm:gap-2.5 sm:p-4"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} sm:h-14 sm:w-14`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-800">{title}</p>
        <p className="text-[11px] text-slate-400">{count}</p>
      </div>
    </motion.button>
  );
}
