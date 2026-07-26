'use client';

import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md text-center">
        <h1 className="text-9xl font-extrabold text-[#4299e1]">404</h1>
        <h2 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Trang không tìm thấy</h2>
        <p className="mt-4 text-base text-gray-500">Xin lỗi, chúng tôi không thể tìm thấy trang bạn đang tìm kiếm.</p>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-[#4299e1] px-5 py-3 text-base font-medium text-white hover:bg-[#3182ce]"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
