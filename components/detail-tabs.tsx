"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function DetailTabs({
  tabs,
}: {
  tabs: { id: string; label: string; content: React.ReactNode }[];
}) {
  const [active, setActive] = useState(tabs[0]?.id);
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Pokémon details"
        className="sticky top-0 z-20 -mx-4 flex gap-1 border-b border-border/60 bg-background/85 px-4 pt-1 backdrop-blur-md"
      >
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative px-3 pb-2 pt-1 text-sm font-medium transition-colors",
                isActive ? "text-foreground" : "text-muted hover:text-foreground",
              )}
            >
              {t.label}
              {isActive && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-foreground" />
              )}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${current.id}`}
        aria-labelledby={`tab-${current.id}`}
        className="pt-4 fade-in"
        key={current.id}
      >
        {current.content}
      </div>
    </div>
  );
}
