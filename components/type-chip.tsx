import { typeStyles } from "@/lib/type-colors";
import type { PokemonType } from "@/lib/types";
import { cn } from "@/lib/cn";

export function TypeChip({
  type,
  size = "sm",
  className,
}: {
  type: PokemonType;
  size?: "sm" | "md";
  className?: string;
}) {
  const styles = typeStyles[type];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium capitalize tracking-tight",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
        styles.chip,
        className,
      )}
    >
      {type}
    </span>
  );
}
