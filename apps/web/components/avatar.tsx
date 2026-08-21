import Image from "next/image";
import { API_ORIGIN } from "@/lib/api-client";

export function Avatar({ photoUrl, size = 48 }: { photoUrl?: string | null; size?: number }) {
  return (
    <div
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-ink-800 ring-1 ring-ink-700"
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
        <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-silver-600" fill="currentColor">
          <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
        </svg>
      )}
    </div>
  );
}
