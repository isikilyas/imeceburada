import type { MetadataRoute } from "next";
import { slugifyTurkish } from "@/lib/slug";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

const STATIC_ROUTES = [
  "",
  "/jobs",
  "/equipment",
  "/material-listings",
  "/site-radar",
  "/wage-index",
  "/material-index",
  "/membership",
  "/login",
  "/register",
  "/forgot-password",
];

async function fetchIds(path: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_URL}${path}?pageSize=200`, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error(`sitemap: ${path} returned ${res.status} — dynamic URLs for this section will be missing`);
      return [];
    }
    const data = (await res.json()) as { items?: { id: string }[] };
    return (data.items ?? []).map((item) => item.id);
  } catch (err) {
    console.error(`sitemap: failed to fetch ${path} — dynamic URLs for this section will be missing`, err);
    return [];
  }
}

/**
 * /is-ilanlari/[city]/[trade] iniş sayfaları için — sadece şu an gerçekten açık
 * ilanı olan şehir+meslek kombinasyonları sitemap'e girer (boş/ince sayfa
 * indekslenmesin diye generateMetadata'daki noindex kuralıyla tutarlı).
 */
async function fetchLandingPagePairs(): Promise<{ city: string; trade: string }[]> {
  try {
    const res = await fetch(`${API_URL}/jobs?pageSize=200`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: { city: string; tradeCategory: string }[] };
    const seen = new Set<string>();
    const pairs: { city: string; trade: string }[] = [];
    for (const item of data.items ?? []) {
      const key = `${item.city}::${item.tradeCategory}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ city: slugifyTurkish(item.city), trade: slugifyTurkish(item.tradeCategory) });
    }
    return pairs;
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobIds, equipmentIds, materialListingIds, siteRequestIds, landingPagePairs] = await Promise.all([
    fetchIds("/jobs"),
    fetchIds("/equipment"),
    fetchIds("/material-listings"),
    fetchIds("/site-requests"),
    fetchLandingPagePairs(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = [
    ...jobIds.map((id) => ({ url: `${SITE_URL}/jobs/${id}`, changeFrequency: "daily" as const, priority: 0.6 })),
    ...equipmentIds.map((id) => ({
      url: `${SITE_URL}/equipment/${id}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...materialListingIds.map((id) => ({
      url: `${SITE_URL}/material-listings/${id}`,
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    ...siteRequestIds.map((id) => ({
      url: `${SITE_URL}/site-radar/${id}`,
      changeFrequency: "daily" as const,
      priority: 0.5,
    })),
    ...landingPagePairs.map(({ city, trade }) => ({
      url: `${SITE_URL}/is-ilanlari/${city}/${trade}`,
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
  ];

  return [...staticEntries, ...dynamicEntries];
}
