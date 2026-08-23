'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Loader2, MapPin, MapPinOff } from 'lucide-react';

interface GeoResponse {
  locality?: string;
  city?: string;
  principalSubdivision?: string;
}

export default function FloatingLocation() {
  const pathname = usePathname();
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [failed, setFailed] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setFailed(true);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords([pos.coords.latitude, pos.coords.longitude]);
        setFailed(false);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setFailed(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    locate();
  }, [locate]);

  useEffect(() => {
    if (!coords) return;
    let cancelled = false;
    fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords[0]}&longitude=${coords[1]}&localityLanguage=vi`
    )
      .then((r) => r.json())
      .then((data: GeoResponse) => {
        if (cancelled) return;
        const parts = [data?.locality || data?.principalSubdivision, data?.city]
          .filter((v, i, arr): v is string => Boolean(v) && arr.indexOf(v) === i)
          .slice(0, 2);
        setLocationName(parts.length ? parts.join(', ') : 'Vị trí của bạn');
      })
      .catch(() => {
        if (!cancelled) setLocationName('Vị trí của bạn');
      });
    return () => {
      cancelled = true;
    };
  }, [coords]);

  const isMapPage = pathname === '/map';

  return (
    <button
      type="button"
      onClick={locate}
      disabled={locating}
      title={locationName ? `${locationName} — nhấn để định vị lại` : 'Nhấn để định vị'}
      className={`fixed right-3 z-[900] flex max-w-[55vw] items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-left shadow-lg backdrop-blur-md transition hover:bg-white disabled:opacity-70 sm:right-4 sm:max-w-[280px] dark:border-slate-700 dark:bg-[#111a2e]/90 dark:hover:bg-[#111a2e] ${
        isMapPage ? 'top-[124px]' : 'top-[68px]'
      }`}
    >
      {locating ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-500" />
      ) : failed ? (
        <MapPinOff className="h-4 w-4 shrink-0 text-amber-500" />
      ) : (
        <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
      )}
      <span className="truncate text-[12px] font-semibold text-slate-700 dark:text-slate-300">
        {locating
          ? 'Đang định vị...'
          : failed
            ? 'Chưa có vị trí — bấm thử lại'
            : locationName || 'Đang xác định vị trí...'}
      </span>
    </button>
  );
}
