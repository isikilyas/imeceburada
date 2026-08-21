"use client";

import { useMemo } from "react";

/**
 * iyzico'nun checkout/initialize API'sinden dönen `checkoutFormContent` HTML+JS
 * içeriğini gömer. Bu içerik üçüncü parti (iyzico) tarafından üretiliyor ve
 * <script> etiketleri içeriyor; ana sayfanın DOM'una doğrudan enjekte etmek
 * (innerHTML + script'i yeniden oluşturup çalıştırmak) iyzico tarafında bir
 * uzlaşma/MITM durumunda bu script'e sayfanın kendi origin'ine (ve dolayısıyla
 * localStorage'daki JWT'lere) tam erişim verir.
 *
 * Bunun yerine içeriği `allow-same-origin` OLMADAN sandbox'lanmış bir iframe
 * içinde render ediyoruz: iframe "null" origin'inde çalışır, bu yüzden içindeki
 * script parent sayfanın localStorage/cookie/DOM'una erişemez — sadece kendi
 * izole belgesinde çalışır ve (allow-top-navigation ile) ödeme tamamlanınca
 * callbackUrl'e yönlendirme yapabilir.
 */
export function IyzicoCheckoutForm({ content }: { content: string }) {
  const srcDoc = useMemo(
    () => `<!doctype html><html><head><meta charset="utf-8" /></head><body style="margin:0">${content}</body></html>`,
    [content],
  );

  return (
    <iframe
      title="iyzico-checkout-form"
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-forms allow-top-navigation allow-top-navigation-by-user-activation allow-popups"
      className="h-[720px] w-full rounded-lg border-0"
    />
  );
}
