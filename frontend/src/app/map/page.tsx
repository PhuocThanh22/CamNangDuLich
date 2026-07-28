import dynamic from 'next/dynamic';

import 'leaflet/dist/leaflet.css';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';

const MapClient = dynamic(() => import('@/components/map/MapClient'), { ssr: false });

export default function MapPage() {
  return <MapClient />;
}
