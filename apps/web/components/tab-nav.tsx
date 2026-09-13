"use client";

interface Tab {
  id: string;
  label: string;
}

/** Hesabım panelindeki bölümler arası geçiş için basit pill-tab navigasyonu. */
export function TabNav({ tabs, active, onChange }: { tabs: Tab[]; active: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-ink-800 pb-3">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
            active === tab.id
              ? "bg-gold-500 text-ink-950"
              : "border border-ink-700 text-silver-400 hover:border-gold-500 hover:text-gold-400"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
