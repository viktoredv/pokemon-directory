import { cn } from "@/lib/cn";

const LABELS: Record<string, string> = {
  hp: "HP",
  attack: "Attack",
  defense: "Defense",
  "special-attack": "Sp. Atk",
  "special-defense": "Sp. Def",
  speed: "Speed",
};

export function StatBar({
  name,
  value,
  max = 200,
  accentClass = "bg-foreground",
}: {
  name: string;
  value: number;
  max?: number;
  accentClass?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="grid grid-cols-[80px_40px_1fr] items-center gap-3 text-sm">
      <span className="text-xs font-medium text-muted">
        {LABELS[name] ?? name}
      </span>
      <span className="tabular text-right text-sm font-semibold">{value}</span>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={cn("h-full rounded-full transition-[width]", accentClass)}
          style={{ width: `${pct}%`, transitionDuration: "600ms" }}
        />
      </div>
    </div>
  );
}
