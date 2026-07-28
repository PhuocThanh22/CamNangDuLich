'use client';

import { useState, useEffect } from 'react';
import { MapPin, UserRound, Menu, X, Shield, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { getUser } from '@/services/authService';
import type { User } from '@/services/authService';

interface NavLink {
  label: string;
  path: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    setIsAdmin(u?.vaitro === 'admin');
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links: NavLink[] = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Bản đồ', path: '/map' },
    { label: 'Thêm địa điểm', path: '/add' },
    ...(isAdmin ? [{ label: 'Quản trị', path: '/admin' }] : []),
  ];

  const isActive = (path: string): boolean => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 shadow-[0_2px_20px_rgba(0,0,0,0.08)] backdrop-blur-md'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="mx-auto flex h-[60px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#3b82f6] text-white shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
            <MapPin className="h-4 w-4" />
          </div>
          <span className="hidden text-[16px] font-bold tracking-tight text-slate-900 sm:block">
            FoodMap<span className="text-[#3b82f6]"> Vietnam</span>
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.path + link.label}
              href={link.path}
              className={`rounded-lg px-4 py-2 text-[14px] font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-[#eff6ff] text-[#3b82f6]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-100 md:flex"
              >
                {user.vaitro === 'admin' && <Shield className="h-3.5 w-3.5 text-blue-600" />}
                {user.ten}
              </Link>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[14px] font-medium text-slate-600 hover:bg-slate-50"
            >
              <UserRound className="h-4 w-4" />
              Đăng nhập
            </Link>
          )}

          <Link
            href="/map"
            className="hidden items-center gap-2 rounded-[10px] bg-[#3b82f6] px-5 py-2 text-[14px] font-semibold text-white shadow-[0_4px_12px_rgba(59,130,246,0.35)] transition hover:bg-[#2563eb] hover:shadow-[0_6px_16px_rgba(59,130,246,0.45)] md:flex"
          >
            Khám phá ngay
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 pb-4 md:hidden">
          <div className="flex flex-col gap-1 pt-3">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.path}
                onClick={() => setMenuOpen(false)}
                className={`w-full rounded-lg px-4 py-3 text-left text-[14px] font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-[#eff6ff] text-[#3b82f6]'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {link.path === '/admin' && <Shield className="mr-1.5 inline h-3.5 w-3.5 text-blue-600" />}
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <Link
                  href="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2.5 text-center text-[14px] text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{user.ten}</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 rounded-lg border border-slate-200 py-2.5 text-center text-[14px] font-medium text-slate-700"
                >
                  Đăng nhập
                </Link>
              )}
              <Link
                href="/map"
                onClick={() => setMenuOpen(false)}
                className="flex-1 rounded-lg bg-[#3b82f6] py-2.5 text-center text-[14px] font-semibold text-white"
              >
                Khám phá ngay
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
