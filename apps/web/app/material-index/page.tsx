"use client";

import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreateMaterialPriceSubmissionInput,
  MATERIAL_TYPES,
  MaterialIndexPoint,
  PRICE_SUBMISSION_TYPES,
  PriceSubmissionType,
  TURKISH_PROVINCES,
  getMaterialUnit,
} from "@bau360/shared";
import { ApiError } from "@/lib/api-client";
import { useAuth } from "@/lib/auth-context";
import { Field, inputClass, selectClass } from "@/components/form";
import { IndexChart } from "@/components/index-chart";
import { ProvinceDistrictSelect } from "@/components/province-district-select";
import { useLocale } from "@/lib/i18n/locale-context";

export default function MaterialIndexPage() {
  const { user, isLoading: authLoading, authFetch } = useAuth();
  const { t } = useLocale();
  const [materialType, setMaterialType] = useState(MATERIAL_TYPES[0].value);
  const [city, setCity] = useState(TURKISH_PROVINCES[0]);
  const [district, setDistrict] = useState("");

  const params = new URLSearchParams({ materialType, city });
  if (district) params.set("district", district);

  const { data, isLoading } = useQuery({
    queryKey: ["material-index", materialType, city, district],
    queryFn: () => authFetch<MaterialIndexPoint[]>(`/material-index?${params.toString()}`),
    enabled: !!user,
  });

  const [form, setForm] = useState<CreateMaterialPriceSubmissionInput>({
    materialType: MATERIAL_TYPES[0].value,
    city: TURKISH_PROVINCES[0],
    district: "",
    amount: 0,
    submissionType: "ACTUAL",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      await authFetch("/material-index", {
        method: "POST",
        body: JSON.stringify({ ...form, district: form.district || undefined }),
      });
      setStatus("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Gönderilemedi");
      setStatus("error");
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="mb-4 text-2xl font-semibold text-silver-300">{t("pages.materialIndexHeading")}</h1>
        <div className="mb-4">
          <Field label="Malzeme">
            <select value={materialType} onChange={(e) => setMaterialType(e.target.value)} className={selectClass}>
              {MATERIAL_TYPES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label} ({m.unit})
                </option>
              ))}
            </select>
          </Field>
          <ProvinceDistrictSelect
            city={city}
            district={district}
            onCityChange={setCity}
            onDistrictChange={setDistrict}
            allowEmptyDistrict
          />
          <p className="mt-1 text-xs text-silver-500">
            İlçe seçmezsen ilin tamamının ortalaması, seçersen sadece o ilçenin ortalaması gösterilir.
          </p>
        </div>
        {authLoading && <p className="text-silver-500">Yükleniyor...</p>}
        {!authLoading && !user && (
          <p className="text-sm text-silver-500">
            Malzeme fiyat endeksini görüntülemek için giriş yapmalısın. İş arayan personel için üyelik tamamen
            ücretsizdir.
          </p>
        )}
        {user && isLoading && <p className="text-silver-500">Yükleniyor...</p>}
        {user && !isLoading && (
          <IndexChart data={data ?? []} unitLabel={`₺/${getMaterialUnit(materialType)}`} />
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-silver-300">Malzeme Fiyatı Paylaş</h2>
        {authLoading && <p className="text-silver-500">Yükleniyor...</p>}
        {!authLoading && !user && <p className="text-sm text-silver-500">Veri paylaşmak için giriş yapmalısın.</p>}
        {user && (
          <>
            <p className="mb-4 rounded-md border border-gold-500/30 bg-ink-800 p-3 text-xs text-silver-400">
              Lütfen gerçek ve güncel fiyat paylaş. Yanlış ya da uydurma veri, herkesin gördüğü fiyat endeksinin
              güvenilirliğini bozar.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Malzeme">
              <select
                value={form.materialType}
                onChange={(e) => setForm({ ...form, materialType: e.target.value })}
                className={selectClass}
              >
                {MATERIAL_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label} ({m.unit})
                  </option>
                ))}
              </select>
            </Field>
            <ProvinceDistrictSelect
              city={form.city}
              district={form.district ?? ""}
              onCityChange={(v) => setForm({ ...form, city: v })}
              onDistrictChange={(v) => setForm({ ...form, district: v })}
              allowEmptyDistrict
            />
            <Field label={`Birim Fiyat (₺/${getMaterialUnit(form.materialType)})`}>
              <input
                type="number"
                min={1}
                required
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Bu bilgi neyi yansıtıyor?">
              <select
                value={form.submissionType}
                onChange={(e) => setForm({ ...form, submissionType: e.target.value as PriceSubmissionType })}
                className={selectClass}
              >
                {PRICE_SUBMISSION_TYPES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="-mt-2 text-xs text-silver-500">
              Endeksin ana rakamı sadece gerçekleşen alış-satışlardan hesaplanır. Teklif/beklenti verisi ayrı bir
              &quot;piyasa beklentisi&quot; çizgisi olarak gösterilir.
            </p>
            {error && <p className="text-sm text-red-400">{error}</p>}
            {status === "done" && <p className="text-sm text-green-400">Teşekkürler, katkın kaydedildi!</p>}
            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-md bg-gold-500 py-2.5 font-medium text-ink-950 hover:bg-gold-400 disabled:opacity-60"
            >
              {status === "submitting" ? "Gönderiliyor..." : "Paylaş"}
            </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}