'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ScrollProgress from '@/components/ui/ScrollProgress';
import type { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isMapPage = pathname === '/map';

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 dark:bg-[#0b1120] dark:text-slate-100">
      {!isMapPage && <ScrollProgress />}
      <Navbar />

      {isMapPage ? (
        <div style={{ height: 'calc(100dvh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
      ) : (
        <>
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </>
      )}
    </div>
  );
}
