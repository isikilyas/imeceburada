"use client";

import { useLocale } from "@/lib/i18n/locale-context";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const { t } = useLocale();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 hover:border-gold-500 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("pagination.previous")}
      </button>
      <span className="text-sm text-silver-500">{t("pagination.pageOf", { page, totalPages })}</span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-ink-700 px-3 py-1.5 text-sm text-silver-300 hover:border-gold-500 hover:text-gold-400 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {t("pagination.next")}
      </button>
    </div>
  );
}
