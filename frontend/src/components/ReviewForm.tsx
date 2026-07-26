'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Star, X } from 'lucide-react';
import { placeService } from '@/services/placeService';
import { getToken } from '@/services/authService';
import { useRouter } from 'next/navigation';

interface ReviewFormProps {
  placeId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewForm({ placeId, open, onClose, onSuccess }: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!getToken()) { router.push('/login'); return; }
    if (rating === 0) { setError('Vui lòng chọn số sao'); return; }
    setLoading(true);
    setError('');
    try {
      await placeService.createReview({
        diadiem_id: placeId,
        diemdanhgia: rating,
        noidung: content.trim() || undefined,
      });
      setRating(0);
      setContent('');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Đánh giá thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[18px] font-bold text-slate-900">Đánh giá của bạn</h2>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center">
                <p className="mb-2 text-[14px] font-medium text-slate-700">Chất lượng món ăn & dịch vụ</p>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-0.5 transition hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-1 text-[13px] font-medium text-amber-600">
                    {['', 'Tệ', 'Không ngon', 'Bình thường', 'Ngon', 'Tuyệt vời'][rating]}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
                  Chia sẻ trải nghiệm (không bắt buộc)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-200"
                  placeholder="Món ăn ở đây rất ngon..."
                  maxLength={500}
                />
                <p className="mt-1 text-right text-[11px] text-slate-400">{content.length}/500</p>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-[13px] font-medium text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || rating === 0}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                Gửi đánh giá
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
