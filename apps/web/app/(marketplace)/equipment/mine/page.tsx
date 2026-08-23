"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EQUIPMENT_TYPES, EquipmentListingDto } from "@imeceburada/shared";
import { useAuth } from "@/lib/auth-context";
import { ListingPhotoUploader } from "@/components/listing-photo-uploader";
import { useLocale } from "@/lib/i18n/locale-context";

function equipmentLabel(value: string) {
  return EQUIPMENT_TYPES.find((e) => e.value === value)?.label ?? value;
}

export default function MyEquipmentPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useLocale();

  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-equipment"],
    queryFn: () => authFetch<EquipmentListingDto[]>("/equipment/mine"),
    enabled: !!user,
  });

  async function handleDeactivate(id: string) {
    await authFetch(`/equipment/${id}`, { method: "DELETE" });
    queryClient.invalidateQueries({ queryKey: ["my-equipment"] });
  }

  if (authLoading) return <p className="text-silver-500">{t("common.loading")}</p>;
  if (!user) return <p className="text-silver-500">{t("listingDetail.equipment.mustLoginToView")}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-silver-300">{t("listingDetail.equipment.myEquipmentHeading")}</h1>
      {isLoading && <p className="text-silver-500">{t("common.loading")}</p>}
      {listings?.length === 0 && <p className="text-silver-500">{t("listingDetail.equipment.noListings")}</p>}

      <div className="space-y-3">
        {listings?.map((listing) => (
          <div key={listing.id} className="space-y-3 rounded-lg border border-ink-800 bg-ink-900 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-silver-200">{equipmentLabel(listing.equipmentType)}</p>
                <p className="text-xs text-silver-500">
                  {listing.city} · {t(`enums.equipmentStatus.${listing.status}`)}
                </p>
              </div>
              {listing.status !== "INACTIVE" && (
                <button onClick={() => handleDeactivate(listing.id)} className="text-sm text-silver-500 hover:text-red-400">
                  {t("listingDetail.equipment.deactivate")}
                </button>
              )}
            </div>
            <ListingPhotoUploader
              endpoint={`/equipment/${listing.id}/photo`}
              photoUrl={listing.photoUrl}
              invalidateKey={["my-equipment"]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
