'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function makeMarkerIcon() {
  return new L.DivIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 4px 10px rgba(59,130,246,0.5));">
        <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:linear-gradient(135deg,#2563eb,#3b82f6);border:3px solid white;display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          </span>
        </div>
        <div style="width:6px;height:6px;background:#3b82f6;border-radius:50%;margin-top:2px;"></div>
      </div>`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
}

const defaultIcon = makeMarkerIcon();

interface ClickHandlerProps {
  onSelect: (lat: number, lng: number) => void;
}

function ClickHandler({ onSelect }: ClickHandlerProps) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface MapPickerProps {
  vido?: number | null;
  kinhdo?: number | null;
  onSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({ vido, kinhdo, onSelect }: MapPickerProps) {
  const center: [number, number] = vido && kinhdo ? [vido, kinhdo] : [21.028, 105.854];

  return (
    <MapContainer
      center={center}
      zoom={13}
      zoomControl={false}
      style={{ width: '100%', height: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ClickHandler onSelect={onSelect} />
      {vido && kinhdo && (
        <Marker position={[vido, kinhdo]} icon={defaultIcon} />
      )}
    </MapContainer>
  );
}
