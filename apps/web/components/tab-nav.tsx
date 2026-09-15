"use client";

interface Tab {
  id: string;
  label: string;
}

/** Hesabım panelindeki bölümler arası geçiş için segmented-control tarzı sekme navigasyonu. */
export function TabNav({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-ink-800 bg-ink-900/60 p-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
            active === tab.id
              ? "bg-gold-500 text-ink-950 shadow-sm shadow-gold-500/20"
              : "text-silver-400 hover:bg-ink-800 hover:text-silver-300"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
