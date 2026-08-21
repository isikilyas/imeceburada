import { ReactNode } from "react";

export const inputClass =
  "w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-silver-200 placeholder:text-silver-500 focus:border-gold-500 focus:outline-none";

export const selectClass = inputClass;

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-silver-500">{label}</span>
      {children}
    </label>
  );
}
