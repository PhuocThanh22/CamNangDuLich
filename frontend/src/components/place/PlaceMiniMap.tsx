'use client';

import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const pinIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#3b82f6;border:3px solid white;box-shadow:0 4px 12px rgba(59,130,246,0.5);display:flex;align-items:center;justify-content:center;">
    <span style="transform:rotate(45deg);font-size:12px;">📍</span></div>`,
  iconSize: [28, 35],
  iconAnchor: [14, 35],
});

interface PlaceMiniMapProps {
  coords: [number, number];
}

export default function PlaceMiniMap({ coords }: PlaceMiniMapProps) {
  const router = useRouter();

  return (
    <div className="relative h-[180px] z-0">
      <MapContainer
        center={coords}
        zoom={16}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png" />
        <Marker position={coords} icon={pinIcon} />
      </MapContainer>
      <div className="absolute inset-x-0 bottom-0 flex justify-center p-3">
        <button
          type="button"
          onClick={() => router.push('/map')}
          className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-4 py-2 text-[12px] font-semibold text-blue-600 shadow-md transition hover:bg-blue-50"
        >
          <MapPin className="h-3.5 w-3.5" />
          Xem trên bản đồ
        </button>
      </div>
    </div>
  );
}
