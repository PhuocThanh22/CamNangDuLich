'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value?: number | null;
  label?: string | null;
  size?: 'sm' | 'md';
}

export default function StarRating({ value, label, size = 'sm' }: StarRatingProps) {
  const parsed = value != null && value > 0 ? value : parseFloat(String(label || ''));
  if (!parsed || Number.isNaN(parsed) || parsed <= 0) {
    return <span className="text-[12px] font-medium text-slate-400">Chưa có đánh giá</span>;
  }
  const filled = Math.max(1, Math.min(5, Math.round(parsed)));
  const starCls = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`${starCls} ${
              i < filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
            }`}
          />
        ))}
      </span>
      {label && <span className="text-[12px] font-semibold text-slate-600">{label}</span>}
    </span>
  );
}
