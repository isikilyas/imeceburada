import { AdSlideshow } from "@/components/ad-slideshow";

export function AdSlot({ side }: { side: "left" | "right" }) {
  return (
    <aside
      className={`fixed top-28 z-30 hidden rounded-lg border border-ink-800 bg-ink-900/60 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] 2xl:block ${
        side === "left" ? "left-4" : "right-4"
      }`}
      style={{
        // İçerik sütunu max-w-6xl (1152px) ile ortalanmış; genişlik, kenar
        // boşluğuna göre hesaplanıp içeriğe asla değmeyecek şekilde büyüyor.
        // Üstten sabit bir mesafede başlar (hero içeriğiyle hizalı), viewport
        // ortasına değil — sayfa kayınca da aynı hizada sabit kalır.
        width: "clamp(164px, calc(50vw - 604px), 380px)",
        height: "clamp(480px, 80vh, 820px)",
      }}
    >
      <AdSlideshow />
    </aside>
  );
}
