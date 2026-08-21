"use client";

import dynamic from "next/dynamic";
import type { SiteMapMarker } from "./site-map-inner";

const SiteMapInner = dynamic(() => import("./site-map-inner").then((m) => m.SiteMapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[16rem] items-center justify-center rounded-lg border border-ink-800 bg-ink-900 text-sm text-silver-500">
      Harita yükleniyor...
    </div>
  ),
});

const TURKEY_CENTER: [number, number] = [39.0, 35.2];

export function SiteMap(props: {
  markers: SiteMapMarker[];
  center?: [number, number];
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  pickedLocation?: [number, number] | null;
  onMarkerClick?: (id: string) => void;
  height?: string;
}) {
  return (
    <SiteMapInner
      markers={props.markers}
      center={props.center ?? TURKEY_CENTER}
      zoom={props.zoom ?? 6}
      onMapClick={props.onMapClick}
      pickedLocation={props.pickedLocation}
      onMarkerClick={props.onMarkerClick}
      height={props.height ?? "24rem"}
    />
  );
}
