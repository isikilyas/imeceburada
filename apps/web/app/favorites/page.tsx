"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { EquipmentListingDto, JobPostingDto, MATERIAL_TYPES, MaterialListingDto } from "@bau360/shared";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { JobCard } from "@/components/job-card";
import { EquipmentCard } from "@/components/equipment-card";
import { FavoriteButton } from "@/components/favorite-button";

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { favorites } = useFavorites();

  const jobFavorites = favorites.filter((f) => f.listingType === "JOB");
  const equipmentFavorites = favorites.filter((f) => f.listingType === "EQUIPMENT");
  const materialFavorites = favorites.filter((f) => f.listingType === "MATERIAL_LISTING");

  const jobQueries = useQueries({
    queries: jobFavorites.map((f) => ({
      queryKey: ["jobs", f.listingId],
      queryFn: () => apiFetch<JobPostingDto>(`/jobs/${f.listingId}`),
    })),
  });
  const equipmentQueries = useQueries({
    queries: equipmentFavorites.map((f) => ({
      queryKey: ["equipment", f.listingId],
      queryFn: () => apiFetch<EquipmentListingDto>(`/equipment/${f.listingId}`),
    })),
  });
  const materialQueries = useQueries({
    queries: materialFavorites.map((f) => ({
      queryKey: ["material-listings", f.listingId],
      queryFn: () => apiFetch<MaterialListingDto>(`/material-listings/${f.listingId}`),
    })),
  });

  if (authLoading) return <p className="text-silver-500">Yükleniyor...</p>;
  if (!user) return <p className="text-silver-500">Favorilerini görmek için giriş yapmalısın.</p>;

  const jobs = jobQueries.map((q) => q.data).filter((j): j is JobPostingDto => !!j);
  const equipment = equipmentQueries.map((q) => q.data).filter((e): e is EquipmentListingDto => !!e);
  const materials = materialQueries.map((q) => q.data).filter((m): m is MaterialListingDto => !!m);

  const isEmpty = favorites.length === 0;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">Favorilerim</h1>

      {isEmpty && (
        <p className="text-silver-500">
          Henüz favori ilanın yok. İlan listelerinde kalp ikonuna tıklayarak buraya ekleyebilirsin.
        </p>
      )}

      {jobs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-silver-300">İş İlanları</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}

      {equipment.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-silver-300">Ekipman İlanları</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {equipment.map((listing) => (
              <EquipmentCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {materials.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-silver-300">Malzeme İlanları</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {materials.map((listing) => (
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
