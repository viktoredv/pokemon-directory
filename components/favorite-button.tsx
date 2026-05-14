"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/use-favorites";
import { cn } from "@/lib/cn";
import { useEffect, useState } from "react";

export function FavoriteButton({
  id,
  size = "md",
  className,
}: {
  id: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const toggle = useFavorites((s) => s.toggle);
  const has = useFavorites((s) => s.ids.includes(id));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const dims =
    size === "lg" ? "h-11 w-11" : size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "lg" ? 22 : size === "sm" ? 14 : 18;

  return (
    <button
      type="button"
      aria-pressed={mounted ? has : undefined}
      aria-label={has ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-border/70 bg-surface/80 backdrop-blur transition-colors",
        "hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        dims,
        className,
      )}
    >
      <Heart
        size={icon}
        className={cn(
          "transition-transform",
          mounted && has
            ? "fill-accent stroke-accent scale-110"
            : "stroke-current text-muted",
        )}
      />
    </button>
  );
}
