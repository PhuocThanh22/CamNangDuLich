'use client';

import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface CategoryCardProps {
  title: string;
  count: string;
  icon: ReactNode;
  bg: string;
  onClick?: () => void;
}

export default function CategoryCard({ title, count, icon, bg, onClick }: CategoryCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className="group relative flex w-full flex-col items-center gap-3 overflow-hidden rounded-2xl border border-slate-100 bg-white px-3 pb-4 pt-6 shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition-colors duration-300 hover:border-slate-200 hover:shadow-[0_12px_32px_rgba(0,0,0,0.1)] sm:gap-3.5 sm:px-4 sm:pb-5"
    >
      <span
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full ${bg} opacity-60 blur-xl transition-transform duration-500 group-hover:scale-150`}
      />
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-2xl ${bg} shadow-sm ring-1 ring-black/5 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:h-14 sm:w-14`}
      >
        {icon}
      </div>
      <div className="relative text-center">
        <p className="text-[14px] font-bold text-slate-800 transition-colors group-hover:text-[#3b82f6] sm:text-[15px]">
          {title}
        </p>
        <p className="mt-1 text-[11px] font-medium text-slate-400">{count}</p>
      </div>
      <span className="absolute right-2.5 top-2.5 flex h-6 w-6 -translate-x-1 items-center justify-center rounded-full bg-[#eff6ff] text-[#3b82f6] opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <ChevronRight className="h-4 w-4" />
      </span>
    </motion.button>
  );
}
