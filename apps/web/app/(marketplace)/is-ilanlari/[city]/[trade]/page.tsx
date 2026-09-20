import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobPostingDto, TRADE_FIELDS, TURKISH_PROVINCES } from "@imeceburada/shared";
import { apiFetch } from "@/lib/api-client";
import { slugifyTurkish } from "@/lib/slug";
import { JobCard } from "@/components/job-card";

/** İnşaat işi arayanların en çok aradığı büyük şehirler — aynı meslek için çapraz bağlantılarda kullanılır. */
const MAJOR_CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Kocaeli",
  "Mersin",
];

function resolveCity(slug: string): string | null {
  return TURKISH_PROVINCES.find((p) => slugifyTurkish(p) === slug) ?? null;
}

function resolveTrade(slug: string): { value: string; label: string; branchLabel: string } | null {
  for (const field of TRADE_FIELDS) {
    for (const branch of field.branches) {
      const found = branch.professions.find((p) => slugifyTurkish(p.value) === slug);
      if (found) return { value: found.value, label: found.label, branchLabel: branch.label };
    }
  }
  return null;
}

/** Aynı branştaki, mevcut meslek dışında birkaç meslek daha — "ilgili aramalar" çapraz linki için. */
function siblingProfessions(tradeValue: string, limit = 5) {
  for (const field of TRADE_FIELDS) {
    for (const branch of field.branches) {
      if (branch.professions.some((p) => p.value === tradeValue)) {
        return branch.professions.filter((p) => p.value !== tradeValue).slice(0, limit);
      }
    }
  }
  return [];
}

async function getJobs(city: string, tradeCategory: string) {
  try {
    return await apiFetch<{ items: JobPostingDto[]; total: number }>(
      `/jobs?city=${encodeURIComponent(city)}&tradeCategory=${encodeURIComponent(tradeCategory)}&pageSize=50`,
    );
  } catch {
    return { items: [], total: 0 };
  }
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; trade: string };
}): Promise<Metadata> {
  const city = resolveCity(params.city);
  const trade = resolveTrade(params.trade);
  if (!city || !trade) return { title: "Sayfa Bulunamadı — İmece Pazaryeri" };

  const { total } = await getJobs(city, trade.value);
  const title = `${trade.label} İş İlanları — ${city} | İmece Pazaryeri`;
  const description =
    total > 0
      ? `${city}'de ${total} açık ${trade.label} iş ilanı. Hemen incele, başvur.`
      : `${city}'de ${trade.label} iş ilanları için İmece Pazaryeri'ni takip et — yeni ilanlar sürekli ekleniyor.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
    // Boş sonuçlu sayfaları indekslemeyip zayıf/ince içerik olarak işaretlenmesini önlüyoruz —
    // insan ziyaretçi için sayfa yine de 200 döner ve tüm ilanlara/diğer bölgelere link verir.
    ...(total === 0 ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function TradeCityLandingPage({ params }: { params: { city: string; trade: string } }) {
  const city = resolveCity(params.city);
  const trade = resolveTrade(params.trade);
  if (!city || !trade) notFound();

  const { items, total } = await getJobs(city, trade.value);
  const siblings = siblingProfessions(trade.value);

  return (
    <div className="mx-auto max-w-3xl">
      <p className="mb-2 text-xs text-silver-500">
        <Link href="/jobs" className="hover:text-gold-400">
          Tüm İlanlar
        </Link>{" "}
        / {trade.branchLabel} / {city}
      </p>
      <h1 className="text-2xl font-semibold text-silver-200 sm:text-3xl">
        {city} {trade.label} İş İlanları
      </h1>
      <p className="mt-3 text-silver-500">
        {total > 0
          ? `${city}'de şu an ${total} açık ${trade.label} ilanı var. Firmalarla doğrudan iletişime geç, hemen başvur.`
          : `${city}'de şu anda açık bir ${trade.label} ilanı bulunmuyor. Aşağıdan tüm ilanlara göz atabilir ya da bu ilana benzer diğer meslekleri inceleyebilirsin.`}
      </p>

      {items.length > 0 && (
        <div className="mt-6 space-y-3">
          {items.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-6 border-t border-ink-800 pt-6 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium text-silver-300">{trade.label} — Diğer Şehirler</p>
          <div className="flex flex-wrap gap-2">
            {MAJOR_CITIES.filter((c) => c !== city).map((c) => (
              <Link
                key={c}
                href={`/is-ilanlari/${slugifyTurkish(c)}/${slugifyTurkish(trade.value)}`}
                className="rounded-full border border-ink-700 px-3 py-1 text-xs text-silver-400 hover:border-gold-500 hover:text-gold-400"
              >
                {c}
              </Link>
            ))}
          </div>
        </div>
        {siblings.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-silver-300">{city} — Benzer Meslekler</p>
            <div className="flex flex-wrap gap-2">
              {siblings.map((p) => (
                <Link
                  key={p.value}
                  href={`/is-ilanlari/${slugifyTurkish(city)}/${slugifyTurkish(p.value)}`}
                  className="rounded-full border border-ink-700 px-3 py-1 text-xs text-silver-400 hover:border-gold-500 hover:text-gold-400"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Link
        href={`/jobs?tradeCategory=${encodeURIComponent(trade.value)}&city=${encodeURIComponent(city)}`}
        className="mt-8 inline-block text-sm text-gold-400 hover:underline"
      >
        Filtrelerle tüm ilanlara git →
      </Link>
    </div>
  );
}
