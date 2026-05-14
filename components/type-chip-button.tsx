"use client";

import { useState } from "react";
import type { PokemonType } from "@/lib/types";
import { typeStyles } from "@/lib/type-colors";
import { TypeModal } from "./type-modal";
import { cn } from "@/lib/cn";

export function TypeChipButton({
  type,
  size = "sm",
}: {
  type: PokemonType;
  size?: "sm" | "md";
}) {
  const [open, setOpen] = useState(false);
  const styles = typeStyles[type];
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "inline-flex items-center rounded-full font-medium capitalize tracking-tight transition hover:opacity-80 active:scale-95",
          size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-3 py-1 text-xs",
          styles.chip,
        )}
        aria-label={`View all ${type}-type Pokémon`}
      >
        {type}
      </button>
      {open && <TypeModal type={type} onClose={() => setOpen(false)} />}
    </>
  );
}
