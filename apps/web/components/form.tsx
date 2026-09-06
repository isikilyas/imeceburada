import { InputHTMLAttributes, ReactNode, useState } from "react";

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

/** Şifre alanı — sağdaki göz ikonuyla girilen şifreyi göster/gizle. */
export function PasswordInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input {...props} type={visible ? "text" : "password"} className={`${inputClass} pr-10`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        aria-label={visible ? "Şifreyi gizle" : "Şifreyi göster"}
        className="absolute inset-y-0 right-0 flex items-center px-3 text-silver-500 hover:text-silver-300"
      >
        {visible ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 5.09A9.77 9.77 0 0112 5c5 0 9 4 10 7a12.9 12.9 0 01-3.16 4.31M6.53 6.53C4 8.24 2.5 10.5 2 12c.64 1.87 2.16 4.11 4.44 5.83A9.77 9.77 0 0012 19c1.06 0 2.07-.15 3-.42"
            />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"
            />
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
    </div>
  );
}
