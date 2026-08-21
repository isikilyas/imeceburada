"use client";

import { getDistrictsForProvince, TURKISH_PROVINCES } from "@bau360/shared";
import { Field, selectClass } from "@/components/form";

interface ProvinceDistrictSelectProps {
  city: string;
  district: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  /** Arama filtrelerinde "Tüm İlçeler" seçeneği eklemek için true geç. */
  allowEmptyDistrict?: boolean;
  /** Arama filtrelerinde "Tüm Şehirler" seçeneği eklemek için true geç. */
  allowEmptyCity?: boolean;
}

/**
 * İki seviyeli il/ilçe seçici — il değişince ilçe listesi güncellenir ve
 * seçili ilçe artık geçerli değilse sıfırlanır. Sitedeki tüm ilan/arama/kayıt
 * formlarında aynı bileşen kullanılır.
 */
export function ProvinceDistrictSelect({
  city,
  district,
  onCityChange,
  onDistrictChange,
  allowEmptyDistrict = false,
  allowEmptyCity = false,
}: ProvinceDistrictSelectProps) {
  const districts = city ? getDistrictsForProvince(city) : [];

  function handleCityChange(nextCity: string) {
    onCityChange(nextCity);
    onDistrictChange("");
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label="Şehir">
        <select value={city} onChange={(e) => handleCityChange(e.target.value)} className={selectClass}>
          {allowEmptyCity && <option value="">Tüm Şehirler</option>}
          {TURKISH_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Field label="İlçe">
        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!city}
          className={selectClass}
        >
          {(allowEmptyDistrict || !district) && (
            <option value="">{allowEmptyDistrict ? "Tüm İlçeler" : "İlçe seç"}</option>
          )}
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>
    </div>
  );
}