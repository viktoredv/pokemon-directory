"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { artworkUrl, formatPokemonName } from "@/lib/pokeapi";
import type { PokemonType } from "@/lib/types";
import { typeStyles } from "@/lib/type-colors";
import { TypeChip } from "./type-chip";
import { cn } from "@/lib/cn";

interface Props {
  title: string;
  hint: string;
  items: { id: number; name: string; type: PokemonType }[];
}

export function MatchupSection({ title, hint, items }: Props) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border/60 bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold">
          {title}{" "}
          <span className="text-xs font-normal text-muted">({hint})</span>
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          {items.length}
          <ChevronDown
            size={15}
            className={cn("transition-transform", open && "rotate-180")}
          />
        </span>
      </button>

      {open && (
        <ul className="divide-y divide-border/40 border-t border-border/40">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                href={`/pokemon/${p.id}`}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 transition hover:bg-surface-muted",
                )}
              >
                <div
                  className={cn(
                    "relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br",
                    typeStyles[p.type].from,
                    typeStyles[p.type].to,
                  )}
                >
                  <Image
                    src={artworkUrl(p.id)}
                    alt={formatPokemonName(p.name)}
                    fill
                    sizes="40px"
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
                <span className="flex-1 text-sm font-medium capitalize">
                  {formatPokemonName(p.name)}
                </span>
                <TypeChip type={p.type} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
