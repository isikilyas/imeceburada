"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Next.js bundles Leaflet's default marker icons incorrectly; point at the CDN instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface SiteMapMarker {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  subtitle?: string;
}

interface SiteMapInnerProps {
  markers: SiteMapMarker[];
  center: [number, number];
  zoom: number;
  onMapClick?: (lat: number, lng: number) => void;
  pickedLocation?: [number, number] | null;
  onMarkerClick?: (id: string) => void;
  height: string;
}

function ClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function SiteMapInner({
  markers,
  center,
  zoom,
  onMapClick,
  pickedLocation,
  onMarkerClick,
  height,
}: SiteMapInnerProps) {
  useEffect(() => {
    // leaflet reads window at import time; nothing to do here besides ensuring client-only mount.
  }, []);

  return (
    <div style={{ height }} className="overflow-hidden rounded-lg border border-ink-800">
      <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onMapClick={onMapClick} />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            eventHandlers={onMarkerClick ? { click: () => onMarkerClick(m.id) } : undefined}
          >
            <Popup>
              <strong>{m.title}</strong>
              {m.subtitle && (
                <>
                  <br />
                  {m.subtitle}
                </>
              )}
            </Popup>
          </Marker>
        ))}
        {pickedLocation && <Marker position={pickedLocation} />}
      </MapContainer>
    </div>
  );
}
