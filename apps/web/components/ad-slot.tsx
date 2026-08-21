import { AdSlideshow } from "@/components/ad-slideshow";

export function AdSlot({ side }: { side: "left" | "right" }) {
  return (
    <aside
      className={`fixed top-1/2 z-30 hidden -translate-y-1/2 rounded-lg border border-ink-800 bg-ink-900/60 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] 2xl:block ${
        side === "left" ? "left-4" : "right-4"
      }`}
      style={{
        // İçerik sütunu max-w-6xl (1152px) ile ortalanmış; genişlik, kenar
        // boşluğuna göre hesaplanıp içeriğe asla değmeyecek şekilde büyüyor.
        width: "clamp(164px, calc(50vw - 604px), 380px)",
        height: "clamp(440px, 72vh, 760px)",
      }}
    >
      <AdSlideshow />
    </aside>
  );
}
