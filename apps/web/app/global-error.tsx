"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="tr">
      <body className="flex min-h-screen items-center justify-center bg-ink-950 text-silver-300">
        <div className="mx-auto max-w-md p-6 text-center">
          <h1 className="mb-2 text-xl font-semibold text-silver-200">Bir şeyler ters gitti</h1>
          <p className="mb-6 text-sm text-silver-500">
            Beklenmedik bir hata oluştu. Sayfayı yenilemeyi deneyebilirsin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-md bg-gold-500 px-5 py-2.5 font-medium text-ink-950 hover:bg-gold-400"
          >
            Sayfayı Yenile
          </button>
        </div>
      </body>
    </html>
  );
}
