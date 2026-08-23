"use client";

import { useState } from "react";
import { MATERIAL_CATEGORIES, MATERIAL_CATEGORY_ITEMS } from "@imeceburada/shared";
import { Field, selectClass } from "@/components/form";
import { useLocale } from "@/lib/i18n/locale-context";

interface MaterialCategoryMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
}

export function MaterialCategoryMultiSelect({ values, onChange }: MaterialCategoryMultiSelectProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(MATERIAL_CATEGORIES[0].items[0].value);

  function handleAdd() {
    if (values.includes(pending)) return;
    onChange([...values, pending]);
  }

  function handleRemove(value: string) {
    onChange(values.filter((v) => v !== value));
  }

  return (
    <div className="space-y-3">
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((v) => (
            <span
              key={v}
              className="flex items-center gap-1.5 rounded-full bg-ink-800 px-3 py-1 text-xs text-gold-400"
            >
              {MATERIAL_CATEGORY_ITEMS.find((i) => i.value === v)?.label ?? v}
              <button
                type="button"
                onClick={() => handleRemove(v)}
                className="text-silver-500 hover:text-red-400"
                aria-label={t("formComponents.materialCategory.remove")}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <Field label={t("formComponents.materialCategory.label")}>
        <select value={pending} onChange={(e) => setPending(e.target.value)} className={selectClass}>
          {MATERIAL_CATEGORIES.map((category) => (
            <optgroup key={category.label} label={`${category.icon} ${category.label}`}>
              {category.items.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </Field>
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-md border border-ink-700 py-2 text-sm font-medium text-silver-300 hover:border-gold-500 hover:text-gold-400"
      >
        {t("formComponents.materialCategory.addButton")}
      </button>
    </div>
  );
}