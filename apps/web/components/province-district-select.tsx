"use client";

import { getDistrictsForProvince, TURKISH_PROVINCES } from "@imeceburada/shared";
import { Field, selectClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

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
  const { t } = useLocale();
  const districts = city ? getDistrictsForProvince(city) : [];

  function handleCityChange(nextCity: string) {
    onCityChange(nextCity);
    onDistrictChange("");
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <Field label={t("formComponents.provinceDistrict.city")}>
        <select value={city} onChange={(e) => handleCityChange(e.target.value)} className={selectClass}>
          {allowEmptyCity && <option value="">{t("formComponents.provinceDistrict.allCities")}</option>}
          {TURKISH_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("formComponents.provinceDistrict.district")}>
        <select
          value={district}
          onChange={(e) => onDistrictChange(e.target.value)}
          disabled={!city}
          className={selectClass}
        >
          {(allowEmptyDistrict || !district) && (
            <option value="">
              {allowEmptyDistrict
                ? t("formComponents.provinceDistrict.allDistricts")
                : t("formComponents.provinceDistrict.selectDistrict")}
            </option>
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