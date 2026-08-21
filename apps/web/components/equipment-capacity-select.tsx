"use client";

import { useEffect, useState } from "react";
import { EQUIPMENT_CAPACITY_OPTIONS_BY_CATEGORY, EQUIPMENT_CATEGORIES } from "@bau360/shared";
import { Field, inputClass, selectClass } from "@/components/form";

const OTHER = "__OTHER__";

interface EquipmentCapacitySelectProps {
  equipmentType: string;
  value: string;
  onChange: (value: string) => void;
}

function findCategoryLabel(equipmentType: string): string | undefined {
  return EQUIPMENT_CATEGORIES.find((c) => c.items.some((i) => i.value === equipmentType))?.label;
}

/**
 * Seçilen ekipmanın kategorisine göre kapasite seçenekleri değişir (ör. kazı
 * makineleri için ton sınıfı, beton pompası için bom uzunluğu metre olarak).
 * Sektörde tek bir standart sınıf olmayan kategorilerde doğrudan serbest
 * metin girişine düşer.
 */
export function EquipmentCapacitySelect({ equipmentType, value, onChange }: EquipmentCapacitySelectProps) {
  const categoryLabel = findCategoryLabel(equipmentType);
  const options = categoryLabel ? EQUIPMENT_CAPACITY_OPTIONS_BY_CATEGORY[categoryLabel] : undefined;

  const [mode, setMode] = useState<"list" | "other">(
    !options || (value !== "" && !options.includes(value)) ? "other" : "list",
  );

  useEffect(() => {
    if (!options) {
      setMode("other");
    } else if (value && !options.includes(value)) {
      setMode("other");
    } else {
      setMode("list");
    }
    // Sadece ekipman türü değiştiğinde kategoriye uygun moda geç.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipmentType]);

  if (!options) {
    return (
      <Field label="Kapasite (opsiyonel, örn. 45 kVA, 120 lt/dk)">
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      </Field>
    );
  }

  return (
    <Field label="Kapasite (opsiyonel)">
      {mode === "list" ? (
        <select
          value={value}
          onChange={(e) => {
            if (e.target.value === OTHER) {
              setMode("other");
              onChange("");
            } else {
              onChange(e.target.value);
            }
          }}
          className={selectClass}
        >
          <option value="">Belirtilmedi</option>
          {options.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={OTHER}>Diğer (elle gir)</option>
        </select>
      ) : (
        <div className="flex gap-2">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Örn. 1.2 m³ kova"
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => {
              setMode("list");
              onChange("");
            }}
            className="shrink-0 rounded-md border border-ink-700 px-3 text-sm text-silver-400 hover:border-gold-500"
          >
            Listeden Seç
          </button>
        </div>
      )}
    </Field>
  );
}