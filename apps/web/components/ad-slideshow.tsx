"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AdSlide {
  icon: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  glow: string;
}

const SLIDES: AdSlide[] = [
  {
    icon: "👷",
    title: "İş mi Arıyorsun?",
    text: "Ücretsiz üye ol, mesleğine ve bölgene uygun ilanları keşfet.",
    cta: "Ücretsiz Kayıt Ol",
    href: "/register",
    glow: "rgba(212,175,55,0.45)",
  },
  {
    icon: "🏗️",
    title: "Ekipman mı Lazım?",
    text: "Kiralık iş makineleri ve ekipmanlar tek platformda.",
    cta: "Ekipmanlara Göz At",
    href: "/equipment",
    glow: "rgba(56,189,248,0.35)",
  },
  {
    icon: "📊",
    title: "Piyasa Nerede?",
    text: "Bölgesel işçilik ücret endeksini canlı olarak takip et.",
    cta: "Endeksi Gör",
    href: "/wage-index",
    glow: "rgba(52,211,153,0.35)",
  },
  {
    icon: "📍",
    title: "Acil İhtiyaç mı Var?",
    text: "Haritada anlık usta ve ekipman çağrısı aç.",
    cta: "Şantiye Radarı",
    href: "/site-radar",
    glow: "rgba(248,113,113,0.35)",
  },
  {
    icon: "🧱",
    title: "Malzeme Tedarikinde",
    text: "Tedarikçilerden güncel inşaat malzemesi ilanlarını incele.",
    cta: "Malzeme İlanları",
    href: "/material-listings",
    glow: "rgba(251,146,60,0.35)",
  },
];

const INTERVAL_MS = 6000;

export function AdSlideshow() {
  const [index, setIndex] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
      setCycle((c) => c + 1);
    }, INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  function goTo(i: number) {
    setIndex(i);
    setCycle((c) => c + 1);
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
      {/* Letterbox bars — sinematik his için */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-3 bg-black" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-3 bg-black" />

      {/* Üst ilerleme çubukları */}
      <div className="absolute inset-x-3 top-5 z-20 flex gap-1">
        {SLIDES.map((slide, i) => (
          <div key={slide.title} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/15">
            {i === index && (
              <div
                key={cycle}
                className="animate-progress-fill h-full w-full bg-gold-400"
                style={{ animationDuration: `${INTERVAL_MS}ms` }}
              />
            )}
            {i < index && <div className="h-full w-full bg-gold-400/70" />}
          </div>
        ))}
      </div>

      {SLIDES.map((slide, i) => {
        const isActive = i === index;
        return (
          <Link
            key={slide.title}
            href={slide.href}
            aria-hidden={!isActive}
            tabIndex={isActive ? 0 : -1}
            className={`absolute inset-0 overflow-hidden transition-opacity duration-[1200ms] ease-out ${
              isActive ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            {isActive && (
              <div
                key={cycle}
                className="animate-ken-burns absolute inset-0 bg-gradient-to-b from-ink-900 to-black"
                style={{ background: `radial-gradient(circle at 50% 30%, ${slide.glow}, transparent 65%), #05060a` }}
              />
            )}
            <div className="cinematic-vignette absolute inset-0" />

            {isActive && (
              <div
                key={`content-${cycle}`}
                className="animate-slide-text-in relative z-10 flex h-full flex-col items-center justify-center gap-3 px-5 pt-4 text-center"
              >
                <span className="text-6xl drop-shadow-[0_0_18px_rgba(255,255,255,0.25)]">{slide.icon}</span>
                <div>
                  <p className="text-base font-semibold tracking-wide text-silver-100">{slide.title}</p>
                  <p className="mx-auto mt-2 max-w-[85%] text-sm leading-relaxed text-silver-400">{slide.text}</p>
                </div>
                <span className="mt-2 rounded-full bg-gold-500 px-5 py-2 text-sm font-medium text-ink-950 shadow-[0_0_20px_rgba(212,175,55,0.4)] transition group-hover:bg-gold-400">
                  {slide.cta}
                </span>
              </div>
            )}
          </Link>
        );
      })}

      <div className="absolute inset-x-0 bottom-5 z-20 flex justify-center gap-1.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              goTo(i);
            }}
            aria-label={`${i + 1}. slayt`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-4 bg-gold-400" : "w-1.5 bg-white/25 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
