import './globals.css';
import ClientLayout from './ClientLayout';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'FoodMap Vietnam - Khám phá ẩm thực đường phố',
  description:
    'Tìm quán ăn ngon gần bạn, xem đánh giá, menu, giá cả và chỉ đường trực tiếp trên bản đồ. Khám phá ẩm thực đường phố Việt Nam dễ dàng hơn với FoodMap.',
  keywords: 'ẩm thực, đồ ăn, đường phố, Việt Nam, bản đồ ẩm thực, foodmap, quán ăn, địa điểm ăn uống',
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: 'FoodMap Vietnam - Khám phá ẩm thực đường phố',
    description:
      'Tìm quán ăn ngon gần bạn, xem đánh giá, menu, giá cả và chỉ đường trực tiếp trên bản đồ.',
    type: 'website',
    locale: 'vi_VN',
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="vi">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
