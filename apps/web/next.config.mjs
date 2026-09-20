import { withSentryConfig } from "@sentry/nextjs";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
const apiOrigin = new URL(apiUrl);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: apiOrigin.protocol.replace(":", ""),
        hostname: apiOrigin.hostname,
        port: apiOrigin.port,
        pathname: "/uploads/**",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  // Source map yükleme bir Sentry auth token'ı gerektirir — şimdilik
  // atlanıyor, hata takibi bundan bağımsız çalışır (sadece minify edilmiş
  // stack trace'ler görülür). İleride SENTRY_AUTH_TOKEN eklenirse otomatik devreye girer.
  silent: true,
  disableLogger: true,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
