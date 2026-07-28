'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, Camera, MapPin, Heart, 
  Clock3, Star, ArrowLeft, Loader2, LogOut,
  ChevronRight, Upload, Check, X, Trash2,
  Navigation, Utensils, Shield
} from 'lucide-react';
import { authService, setUser, getUser, removeToken, getToken } from '@/services/authService';
import { placeService } from '@/services/placeService';
import type { User as UserType } from '@/services/authService';

interface Tab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff&size=200';

interface Place {
  id: number;
  ten: string;
  hinh?: string;
  monan?: string;
  phanloai?: string;
  danhgia?: string;
  gia?: string;
  diachi?: string;
  trangthai?: string;
  khoangcach?: string;
  daduyet?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('info');
  const [user, setUserState] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [ten, setTen] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [matkhauCu, setMatkhauCu] = useState('');
  const [matkhauMoi, setMatkhauMoi] = useState('');
  const [matkhauXacnhan, setMatkhauXacnhan] = useState('');

  const [favorites, setFavorites] = useState<Place[]>([]);
  const [contributions, setContributions] = useState<Place[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [loadingContributions, setLoadingContributions] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push('/login');
      return;
    }
    setUserState(u);
    setTen(u.ten || '');
    setEmail(u.email || '');
    setAvatar(u.avatar || '');
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;
    if (activeTab === 'favorites') loadFavorites();
    if (activeTab === 'contributions') loadContributions();
  }, [activeTab, user]);

  async function loadFavorites() {
    setLoadingFavorites(true);
    try {
      const res = await placeService.getFavorites();
      setFavorites(res.data || []);
    } catch {
      setFavorites([]);
    } finally {
      setLoadingFavorites(false);
    }
  }

  async function loadContributions() {
    setLoadingContributions(true);
    try {
      const res = await placeService.getMyPlaces();
      setContributions(res.data || []);
    } catch {
      setContributions([]);
    } finally {
      setLoadingContributions(false);
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await authService.updateProfile({ ten, email, avatar: avatar || null });
      const updated = res.data;
      setUserState(updated);
      setUser(updated);
      setSuccess('Thông tin đã được cập nhật');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (matkhauMoi !== matkhauXacnhan) {
      setError('Mật khẩu mới không khớp');
      return;
    }
    setPasswordSaving(true);
    try {
      await authService.changePassword({ matkhau_cu: matkhauCu, matkhau_moi: matkhauMoi });
      setSuccess('Mật khẩu đã được thay đổi');
      setMatkhauCu('');
      setMatkhauMoi('');
      setMatkhauXacnhan('');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setError(axiosErr.response?.data?.detail || 'Có lỗi xảy ra');
    } finally {
      setPasswordSaving(false);
    }
  }

  function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleLogout() {
    removeToken();
    router.push('/');
  }

  async function handleToggleFavorite(placeId: number) {
    try {
      await placeService.toggleFavorite(placeId);
      loadFavorites();
    } catch {}
  }

  const fieldClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 transition focus:border-[#3b82f6] focus:bg-white focus:ring-2 focus:ring-[#3b82f6]/20';

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#3b82f6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e40af] to-[#3b82f6] px-5 pb-16 pt-8 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.push('/')}
            className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Trang chủ
          </button>

          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-white/30 shadow-lg">
                <img
                  src={avatar || DEFAULT_AVATAR}
                  alt={user?.ten}
                  className="h-full w-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md transition hover:bg-slate-100"
              >
                <Camera className="h-4 w-4 text-slate-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-[24px] font-bold text-white">{user?.ten}</h1>
              <p className="text-[14px] text-blue-200">{user?.email}</p>
              <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-[12px] font-medium text-white">
                {user?.vaitro === 'admin' ? 'Quản trị viên' : 'Thành viên'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10" style={{ marginTop: '-2rem' }}>
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar tabs */}
          <div className="lg:w-64">
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
              <div className="flex gap-1 overflow-x-auto p-2 lg:flex-col">
                {[
                  { key: 'info', label: 'Thông tin tài khoản', icon: <User className="h-4 w-4" /> },
                  { key: 'favorites', label: 'Địa điểm yêu thích', icon: <Heart className="h-4 w-4" /> },
                  { key: 'contributions', label: 'Địa điểm đã đóng góp', icon: <MapPin className="h-4 w-4" /> },
                  ...(user?.vaitro === 'admin' ? [{ key: 'admin', label: 'Quản trị', icon: <Shield className="h-4 w-4" /> }] : []),
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      if (tab.key === 'admin') { router.push('/admin'); return; }
                      setActiveTab(tab.key);
                    }}
                    className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-[13px] font-semibold transition lg:w-full ${
                      activeTab === tab.key
                        ? 'bg-[#eff6ff] text-[#3b82f6]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={activeTab === tab.key ? 'text-[#3b82f6]' : 'text-slate-400'}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[13px] font-semibold text-red-500 transition hover:bg-red-50 lg:w-full"
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>

          {/* Main content */}
          <div className="flex-1">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-[13px] font-medium text-red-600">{error}</div>
            )}
            {success && (
              <div className="mb-4 rounded-xl bg-green-50 p-3 text-[13px] font-medium text-green-600">{success}</div>
            )}

            {/* Tab: Thông tin tài khoản */}
            {activeTab === 'info' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-8">
                  <h2 className="text-[18px] font-bold text-slate-900">Thông tin cá nhân</h2>
                  <p className="mb-6 text-[13px] text-slate-500">Cập nhật thông tin cơ bản của bạn</p>

                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Tên</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white">
                        <User className="h-4 w-4 text-slate-400" />
                        <input
                          value={ten}
                          onChange={(e) => setTen(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Email</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(59,130,246,0.4)] transition hover:bg-[#2563eb] disabled:opacity-60"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Lưu thay đổi
                    </button>
                  </form>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-8">
                  <h2 className="text-[18px] font-bold text-slate-900">Đổi mật khẩu</h2>
                  <p className="mb-6 text-[13px] text-slate-500">Cập nhật mật khẩu đăng nhập của bạn</p>

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Mật khẩu hiện tại</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={matkhauCu}
                          onChange={(e) => setMatkhauCu(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Mật khẩu mới</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={matkhauMoi}
                          onChange={(e) => setMatkhauMoi(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Xác nhận mật khẩu mới</label>
                      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-blue-400 focus-within:bg-white">
                        <Lock className="h-4 w-4 text-slate-400" />
                        <input
                          type="password"
                          value={matkhauXacnhan}
                          onChange={(e) => setMatkhauXacnhan(e.target.value)}
                          className="w-full bg-transparent text-[14px] text-slate-900 outline-none"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-6 py-3 text-[14px] font-bold text-white transition hover:bg-slate-900 disabled:opacity-60"
                    >
                      {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      Đổi mật khẩu
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Tab: Địa điểm yêu thích */}
            {activeTab === 'favorites' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-8">
                  <h2 className="text-[18px] font-bold text-slate-900">Địa điểm yêu thích</h2>
                  <p className="mb-6 text-[13px] text-slate-500">Những địa điểm bạn đã lưu</p>

                  {loadingFavorites ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
                    </div>
                  ) : favorites.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <Heart className="mb-3 h-10 w-10 text-slate-300" />
                      <p className="text-[14px] font-medium text-slate-500">Chưa có địa điểm yêu thích</p>
                      <p className="mt-1 text-[12px] text-slate-400">Khám phá và lưu các địa điểm bạn yêu thích</p>
                      <button
                        onClick={() => router.push('/map')}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2563eb]"
                      >
                        <MapPin className="h-4 w-4" /> Khám phá bản đồ
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {favorites.map((place) => (
                        <motion.div
                          key={place.id}
                          whileHover={{ y: -3 }}
                          className="group cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                        >
                          <div
                            className="flex h-full"
                            onClick={() => router.push(`/place/${place.id}`)}
                          >
                            <div className="h-[130px] w-[100px] shrink-0 overflow-hidden">
                              <img
                                src={place.hinh || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'}
                                alt={place.ten}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'; }}
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-3">
                              <div>
                                <h3 className="text-[14px] font-bold text-slate-900">{place.ten}</h3>
                                <span className="mt-1 inline-flex rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                                  {place.monan || place.phanloai || 'Ẩm thực'}
                                </span>
                                <div className="mt-1.5 flex items-center gap-1 text-[12px] text-slate-500">
                                  <Star className="h-3 w-3 text-amber-400" />
                                  <span>{place.danhgia || '4.5'}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-medium text-orange-500">{place.gia || '30k–100k đ'}</span>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(place.id); }}
                                  className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-50 hover:text-red-500"
                                >
                                  <Heart className="h-4 w-4 fill-current" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tab: Địa điểm đã đóng góp */}
            {activeTab === 'contributions' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="rounded-2xl bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.06)] sm:p-8">
                  <h2 className="text-[18px] font-bold text-slate-900">Địa điểm đã đóng góp</h2>
                  <p className="mb-6 text-[13px] text-slate-500">Những địa điểm bạn đã thêm vào hệ thống</p>

                  {loadingContributions ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-[#3b82f6]" />
                    </div>
                  ) : contributions.length === 0 ? (
                    <div className="flex flex-col items-center py-12 text-center">
                      <MapPin className="mb-3 h-10 w-10 text-slate-300" />
                      <p className="text-[14px] font-medium text-slate-500">Chưa có địa điểm đóng góp</p>
                      <p className="mt-1 text-[12px] text-slate-400">Chia sẻ địa điểm ẩm thực bạn biết với cộng đồng</p>
                      <button
                        onClick={() => router.push('/add')}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2563eb]"
                      >
                        <MapPin className="h-4 w-4" /> Thêm địa điểm mới
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {contributions.map((place) => (
                        <motion.div
                          key={place.id}
                          whileHover={{ y: -3 }}
                          className="group cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:shadow-md"
                        >
                          <div
                            className="flex h-full"
                            onClick={() => router.push(`/place/${place.id}`)}
                          >
                            <div className="h-[130px] w-[100px] shrink-0 overflow-hidden">
                              <img
                                src={place.hinh || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'}
                                alt={place.ten}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80'; }}
                              />
                            </div>
                            <div className="flex flex-1 flex-col justify-between p-3">
                              <div>
                                <h3 className="text-[14px] font-bold text-slate-900">{place.ten}</h3>
                                <span className="mt-1 inline-flex rounded bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-600">
                                  {place.monan || place.phanloai || 'Ẩm thực'}
                                </span>
                                <div className="mt-1.5 flex items-center gap-1 text-[12px] text-slate-500">
                                  <MapPin className="h-3 w-3" />
                                  <span>{place.diachi || 'Chưa có địa chỉ'}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-[12px]">
                                  {place.daduyet === false ? (
                                    <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold text-amber-700">Chờ duyệt</span>
                                  ) : (
                                    <>
                                      <Clock3 className="h-3 w-3 text-slate-400" />
                                      <span className="text-slate-400">{place.trangthai || 'Đang mở'}</span>
                                    </>
                                  )}
                                </div>
                                <span className="text-[12px] text-slate-400">{place.khoangcach || ''}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
