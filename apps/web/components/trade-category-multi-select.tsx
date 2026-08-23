"use client";

import { useState } from "react";
import { TRADE_CATEGORIES, TRADE_FIELDS } from "@bau360/shared";
import { TradeCategorySelect } from "@/components/trade-category-select";
import { useLocale } from "@/lib/i18n/locale-context";

interface TradeCategoryMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
}

export function TradeCategoryMultiSelect({ values, onChange }: TradeCategoryMultiSelectProps) {
  const { t } = useLocale();
  const [pending, setPending] = useState(TRADE_FIELDS[0].branches[0].professions[0].value);

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
              {TRADE_CATEGORIES.find((t) => t.value === v)?.label ?? v}
              <button
                type="button"
                onClick={() => handleRemove(v)}
                className="text-silver-500 hover:text-red-400"
                aria-label={t("formComponents.tradeCategory.remove")}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <TradeCategorySelect value={pending} onChange={setPending} />
      <button
        type="button"
        onClick={handleAdd}
        className="w-full rounded-md border border-ink-700 py-2 text-sm font-medium text-silver-300 hover:border-gold-500 hover:text-gold-400"
      >
        {t("formComponents.tradeCategory.addButton")}
      </button>
    </div>
  );
}