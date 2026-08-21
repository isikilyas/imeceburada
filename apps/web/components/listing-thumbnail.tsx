import Image from "next/image";
import { API_ORIGIN } from "@/lib/api-client";

export function ListingThumbnail({
  photoUrl,
  icon,
  size = 64,
}: {
  photoUrl?: string | null;
  icon?: string;
  size?: number;
}) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink-800 ring-1 ring-ink-700"
      style={{ width: size, height: size }}
    >
      {photoUrl ? (
        <Image
          src={`${API_ORIGIN}${photoUrl}`}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-2xl opacity-60">{icon ?? "📦"}</span>
      )}
    </div>
  );
}
