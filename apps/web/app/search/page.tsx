"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  EquipmentListingDto,
  JobPostingDto,
  MATERIAL_TYPES,
  MaterialListingDto,
  PaginatedResult,
} from "@bau360/shared";
import { apiFetch } from "@/lib/api-client";
import { JobCard } from "@/components/job-card";
import { EquipmentCard } from "@/components/equipment-card";
import { FavoriteButton } from "@/components/favorite-button";
import { SearchBox } from "@/components/search-box";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";

  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ["search-jobs", q],
    queryFn: () => apiFetch<PaginatedResult<JobPostingDto>>(`/jobs?q=${encodeURIComponent(q)}&pageSize=10`),
    enabled: q.length > 0,
  });
  const { data: equipment, isLoading: equipmentLoading } = useQuery({
    queryKey: ["search-equipment", q],
    queryFn: () => apiFetch<PaginatedResult<EquipmentListingDto>>(`/equipment?q=${encodeURIComponent(q)}&pageSize=10`),
    enabled: q.length > 0,
  });
  const { data: materials, isLoading: materialsLoading } = useQuery({
    queryKey: ["search-materials", q],
    queryFn: () =>
      apiFetch<PaginatedResult<MaterialListingDto>>(`/material-listings?q=${encodeURIComponent(q)}&pageSize=10`),
    enabled: q.length > 0,
  });

  const isLoading = jobsLoading || equipmentLoading || materialsLoading;
  const totalResults = (jobs?.items.length ?? 0) + (equipment?.items.length ?? 0) + (materials?.items.length ?? 0);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold text-silver-300">Arama Sonuçları</h1>
      <p className="mb-6 text-sm text-silver-500">
        {q ? (
          <>
            <span className="text-gold-400">&ldquo;{q}&rdquo;</span> için sonuçlar
          </>
        ) : (
          "Aramak için yukarıdaki kutuya bir kelime yaz."
        )}
      </p>

      <div className="mb-6 max-w-md lg:hidden">
        <SearchBox />
      </div>

      {q && isLoading && <p className="text-silver-500">Aranıyor...</p>}
      {q && !isLoading && totalResults === 0 && <p className="text-silver-500">Sonuç bulunamadı.</p>}

      {!!jobs?.items.length && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-silver-300">İş İlanları ({jobs.items.length})</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {jobs.items.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {!!equipment?.items.length && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-silver-300">Ekipman İlanları ({equipment.items.length})</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {equipment.items.map((listing) => (
              <EquipmentCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {!!materials?.items.length && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-silver-300">Malzeme İlanları ({materials.items.length})</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {materials.items.map((listing) => (
              <Link
                key={listing.id}
                href={`/material-listings/${listing.id}`}
                className="block rounded-lg border border-ink-800 bg-ink-900 p-4 hover:border-gold-500"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-silver-200">
                      {MATERIAL_TYPES.find((m) => m.value === listing.materialType)?.label ?? listing.materialType}
                    </h3>
                    <p className="text-sm text-silver-500">{listing.supplierName}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400">{listing.city}</span>
                    <FavoriteButton listingType="MATERIAL_LISTING" listingId={listing.id} />
                  </div>
                </div>
                <p className="mt-3 text-sm text-gold-400">
                  {listing.price} ₺/{listing.unit}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<p className="text-silver-500">Yükleniyor...</p>}>
      <SearchResults />
    </Suspense>
  );
}
