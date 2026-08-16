'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Shield, Users, MapPin, MessageCircle, Clock, Check, X,
  ArrowLeft, Loader2, Search, Image as ImageIcon
} from 'lucide-react';
import { getUser } from '@/services/authService';
import { adminService } from '@/services/adminService';
import type { AdminStats, AdminPlace } from '@/services/adminService';
import type { User } from '@/services/authService';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [allPlaces, setAllPlaces] = useState<AdminPlace[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [processing, setProcessing] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/login'); return; }
    if (u.vaitro !== 'admin') { router.push('/'); return; }
    setUser(u);
    loadData();
  }, []);

  async function loadData() {
    try {
      const [statsRes, placesRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPlaces(),
      ]);
      setStats(statsRes.data);
      setAllPlaces(placesRes.data);
    } catch { }
    setLoading(false);
  }

  async function handleApprove(id: number) {
    setProcessing(id);
    try {
      await adminService.approvePlace(id);
      setAllPlaces((prev) => prev.map((p) => p.id === id ? { ...p, daduyet: true } : p));
      if (stats) setStats({ ...stats, pending_places: stats.pending_places - 1 });
    } catch { }
    setProcessing(null);
  }

  async function handleReject(id: number) {
    if (!confirm('Bạn có chắc muốn từ chối địa điểm này?')) return;
    setProcessing(id);
    try {
      await adminService.rejectPlace(id);
      setAllPlaces((prev) => prev.filter((p) => p.id !== id));
      if (stats) setStats({ ...stats, pending_places: stats.pending_places - 1, total_places: stats.total_places - 1 });
    } catch { }
    setProcessing(null);
  }

  const pendingPlaces = allPlaces.filter((p) => !p.daduyet);
  const filteredPlaces = activeTab === 'pending'
    ? pendingPlaces
    : allPlaces.filter((p) => p.ten.toLowerCase().includes(search.toLowerCase()));

  const statCards = stats ? [
    { label: 'Người dùng', value: stats.total_users, icon: <Users className="h-5 w-5" />, color: 'bg-blue-500' },
    { label: 'Địa điểm', value: stats.total_places, icon: <MapPin className="h-5 w-5" />, color: 'bg-green-500' },
    { label: 'Chờ duyệt', value: stats.pending_places, icon: <Clock className="h-5 w-5" />, color: 'bg-amber-500' },
    { label: 'Đánh giá', value: stats.total_reviews, icon: <MessageCircle className="h-5 w-5" />, color: 'bg-purple-500' },
  ] : [];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] dark:bg-[#0b1120]">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-[#f8fafc] px-5 py-8 sm:px-8 lg:px-10 dark:bg-[#0b1120]"
    >
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push('/')}
          className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Trang chủ
        </button>

        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3b82f6] shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#3b82f6]">Quản trị hệ thống</p>
            <h1 className="text-[24px] font-black tracking-tight text-slate-900 sm:text-[30px] dark:text-white">Trang quản trị</h1>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-2xl bg-white p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#111a2e]"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color} text-white shadow-lg`}>
                  {card.icon}
                </div>
              </div>
              <p className="text-[28px] font-black text-slate-900 dark:text-white">{card.value}</p>
              <p className="mt-1 text-[13px] font-medium text-slate-500 dark:text-slate-400">{card.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex items-center gap-1 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`relative px-5 py-3 text-[14px] font-semibold transition-colors ${
              activeTab === 'pending' ? 'text-[#3b82f6]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Chờ duyệt
            {pendingPlaces.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {pendingPlaces.length}
              </span>
            )}
            {activeTab === 'pending' && (
              <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#3b82f6]" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-5 py-3 text-[14px] font-semibold transition-colors ${
              activeTab === 'all' ? 'text-[#3b82f6]' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Tất cả địa điểm
            {activeTab === 'all' && (
              <motion.div layoutId="admin-tab" className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-[#3b82f6]" />
            )}
          </button>
        </div>

        {activeTab === 'all' && (
          <div className="mb-4 relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm địa điểm..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-[14px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/20 dark:border-slate-700 dark:bg-[#0f172a] dark:text-slate-200"
            />
          </div>
        )}

        <div className="space-y-3">
          {filteredPlaces.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow-[0_2px_16px_rgba(0,0,0,0.06)] dark:bg-[#111a2e]">
              <Shield className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-[15px] font-semibold text-slate-600 dark:text-slate-300">
                {activeTab === 'pending' ? 'Không có địa điểm chờ duyệt' : 'Không tìm thấy địa điểm'}
              </p>
            </div>
          ) : (
            filteredPlaces.map((place, idx) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="rounded-2xl bg-white p-4 shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] sm:p-5 dark:bg-[#111a2e]"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl sm:h-20 sm:w-20">
                    {place.hinh ? (
                      <img src={place.hinh} alt={place.ten} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <ImageIcon className="h-6 w-6 text-slate-300 dark:text-slate-500" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-[15px] font-bold text-slate-900 dark:text-white">{place.ten}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            {place.phanloai}
                          </span>
                          <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                            place.daduyet
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {place.daduyet ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>
                      </div>
                      {!place.daduyet && (
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => handleApprove(place.id)}
                            disabled={processing === place.id}
                            className="flex items-center gap-1.5 rounded-xl bg-green-500 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(34,197,94,0.4)] transition hover:bg-green-600 disabled:opacity-60"
                          >
                            {processing === place.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(place.id)}
                            disabled={processing === place.id}
                            className="flex items-center gap-1.5 rounded-xl bg-red-500 px-4 py-2 text-[12px] font-bold text-white shadow-[0_4px_12px_rgba(239,68,68,0.4)] transition hover:bg-red-600 disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" />
                            Từ chối
                          </button>
                        </div>
                      )}
                      {place.daduyet && activeTab === 'all' && (
                        <span className="flex shrink-0 items-center gap-1 rounded-xl bg-green-50 px-3 py-1.5 text-[12px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
                          <Check className="h-3.5 w-3.5" /> Đã duyệt
                        </span>
                      )}
                    </div>
                    {place.diachi && (
                      <p className="mt-1.5 text-[12px] text-slate-500 line-clamp-1 dark:text-slate-400">{place.diachi}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
