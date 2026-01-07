'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { mapLocations } from '@/lib/data/mockData';

export function MapPanel() {
  const mapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [12.4964, 41.9028],
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl({ showZoom: true }), 'top-right');

    const markers = mapLocations.map((location) => {
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.style.backgroundColor =
        location.status === 'Allerta' ? 'rgba(255, 189, 114, 0.9)' : 'rgba(120, 220, 180, 0.9)';

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(location.coords)
        .setPopup(new maplibregl.Popup({ offset: 16 }).setText(location.name))
        .addTo(map);

      return marker;
    });

    return () => {
      markers.forEach((marker) => marker.remove());
      map.remove();
    };
  }, []);

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl">
      <div ref={mapRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-xl bg-white/70 px-3 py-2 text-xs shadow-glass">
        <p className="font-semibold text-ink/80">4 nodi connessi</p>
        <p className="text-[10px] uppercase tracking-[0.2em] text-ink/50">Roma centro</p>
      </div>
    </div>
  );
}
