"use client";

import { useEffect, useState } from "react";
import { EQUIPMENT_CATEGORIES } from "@imeceburada/shared";
import { Field, selectClass } from "@/components/form";
import { CustomTermInput } from "@/components/custom-term-input";
import { useLocale } from "@/lib/i18n/locale-context";

interface EquipmentCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}

function findCategory(value: string) {
  return EQUIPMENT_CATEGORIES.find((c) => c.items.some((i) => i.value === value));
}

export function EquipmentCategorySelect({ value, onChange, allowEmpty = false }: EquipmentCategorySelectProps) {
  const { t } = useLocale();
  const [categoryLabel, setCategoryLabel] = useState(
    findCategory(value)?.label ?? (allowEmpty ? "" : EQUIPMENT_CATEGORIES[0].label),
  );
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    const cat = findCategory(value);
    if (cat) setCategoryLabel(cat.label);
  }, [value]);

  const category = EQUIPMENT_CATEGORIES.find((c) => c.label === categoryLabel);
  const items = category?.items ?? [];

  function handleCategoryChange(nextLabel: string) {
    setCategoryLabel(nextLabel);
    const nextCategory = EQUIPMENT_CATEGORIES.find((c) => c.label === nextLabel);
    onChange(allowEmpty || !nextCategory ? "" : (nextCategory.items[0]?.value ?? ""));
  }

  return (
    <div className="space-y-3">
      <Field label={t("formComponents.equipmentCategory.category")}>
        <select value={categoryLabel} onChange={(e) => handleCategoryChange(e.target.value)} className={selectClass}>
          {allowEmpty && <option value="">{t("formComponents.equipmentCategory.allCategories")}</option>}
          {EQUIPMENT_CATEGORIES.map((c) => (
            <option key={c.label} value={c.label}>
              {c.icon} {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label={t("formComponents.equipmentCategory.equipment")}>
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={!categoryLabel} className={selectClass}>
          {allowEmpty && <option value="">{t("formComponents.equipmentCategory.allEquipment")}</option>}
          {items.map((i) => (
            <option key={i.value} value={i.value}>
              {i.label}
            </option>
          ))}
        </select>
      </Field>
      <div>
        <button
          type="button"
          onClick={() => setShowCustom((s) => !s)}
          className="text-xs text-silver-500 hover:text-gold-400"
        >
          {showCustom ? "Listeden seç" : "Listede yok mu? Kendi terimini yaz"}
        </button>
        {showCustom && (
          <div className="mt-2">
            <CustomTermInput
              type="EQUIPMENT_TYPE"
              onAdd={(v) => {
                onChange(v);
                setShowCustom(false);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}