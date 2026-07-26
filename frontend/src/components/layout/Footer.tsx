'use client';

import { Mail, Phone, MapPin, Heart } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';

const FacebookIcon: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const YoutubeIcon: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const InstagramIcon: FC = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface NavLinkItem {
  label: string;
  path: string;
}

interface NavLinkGroup {
  heading: string;
  items: NavLinkItem[];
}

interface Social {
  Icon: FC;
  label: string;
}

export default function Footer() {
  const navLinks: NavLinkGroup[] = [
    {
      heading: 'KHÁM PHÁ',
      items: [
        { label: 'Bản đồ ẩm thực', path: '/map' },
        { label: 'Địa điểm nổi bật', path: '/' },
        { label: 'Đặc sản địa phương', path: '/' },
      ],
    },
    {
      heading: 'CỘNG ĐỒNG',
      items: [
        { label: 'Thêm địa điểm mới', path: '/add' },
        { label: 'Hồ sơ của tôi', path: '/login' },
        { label: 'Đánh giá & nhận xét', path: '/' },
      ],
    },
  ];

  const socials: Social[] = [
    { Icon: FacebookIcon, label: 'Facebook' },
    { Icon: YoutubeIcon, label: 'YouTube' },
    { Icon: InstagramIcon, label: 'Instagram' },
  ];

  return (
    <footer className="bg-[#0f172a]">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-10">
        <div className="mb-12 flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-[260px]">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#3b82f6] text-white">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="text-[16px] font-bold text-white">FoodMap Vietnam</span>
            </div>
            <p className="mb-5 text-[14px] leading-relaxed text-slate-400">
              Khám phá ẩm thực đường phố gần bạn
            </p>
            <div className="flex gap-2">
              {socials.map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/8 text-slate-400 transition hover:border-white/20 hover:bg-white/15 hover:text-white"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {navLinks.map((group) => (
              <div key={group.heading} className="space-y-3">
                <p className="text-[11px] font-bold tracking-[1px] text-slate-400">{group.heading}</p>
                {group.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.path}
                    className="block text-left text-[14px] text-slate-400 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            <div className="space-y-3">
              <p className="text-[11px] font-bold tracking-[1px] text-slate-400">LIÊN HỆ</p>
              <a href="mailto:hello@foodmapvn.com" className="flex items-center gap-2 text-[14px] text-slate-400 transition hover:text-white">
                <Mail className="h-3.5 w-3.5" /> hello@foodmapvn.com
              </a>
              <a href="tel:18006868" className="flex items-center gap-2 text-[14px] text-slate-400 transition hover:text-white">
                <Phone className="h-3.5 w-3.5" /> 1800 6868
              </a>
              <p className="flex items-center gap-2 text-[14px] text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> TP. Hồ Chí Minh, Việt Nam
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10" />

        <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-[13px] text-slate-500">
            &copy; 2026 FoodMap Vietnam. Bảo lưu mọi quyền.
          </p>
          <p className="text-[13px] text-slate-500">Làm với <Heart className="h-4 w-4 inline fill-current text-red-500" /> tại Việt Nam</p>
        </div>
      </div>
    </footer>
  );
}
