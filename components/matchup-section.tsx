"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { artworkUrl, formatPokemonName } from "@/lib/pokeapi";
import type { PokemonType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { TypeChip } from "./type-chip";

interface Props {
  title: string;
  hint: string;
  items: { id: number; name: string; types: PokemonType[] }[];
}

export function MatchupSection({ title, hint, items }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  if (items.length === 0) return null;

  const filtered = query.trim()
    ? items.filter((p) =>
        formatPokemonName(p.name).toLowerCase().includes(query.trim().toLowerCase()),
      )
    : items;

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
        <>
          <div className="border-t border-border/40 px-4 py-2">
            <label className="relative flex items-center">
              <Search size={13} className="pointer-events-none absolute left-2.5 text-muted" aria-hidden />
              <input
                type="search"
                autoComplete="off"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 w-full rounded-full border border-border/60 bg-surface-muted pl-8 pr-3 text-[13px] placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </label>
            {query && (
              <p className="mt-1.5 text-[11px] text-muted">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          <ul className="divide-y divide-border/40 border-t border-border/40">
            {filtered.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pokemon/${p.id}`}
                  className="flex items-center gap-3 px-4 py-2 transition hover:bg-surface-muted"
                >
                  <div className="relative h-10 w-10 shrink-0 rounded-xl bg-surface-muted">
                    <Image
                      src={artworkUrl(p.id)}
                      alt={formatPokemonName(p.name)}
                      fill
                      sizes="40px"
                      className="object-contain p-0.5"
                      unoptimized
                    />
                  </div>
                  <span className="flex-1 text-sm font-medium">
                    {formatPokemonName(p.name)}
                  </span>
                  <div className="flex flex-wrap justify-end gap-1">
                    {p.types.map((t) => (
                      <TypeChip key={t} type={t} />
                    ))}
                  </div>
                </Link>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-4 py-4 text-center text-xs text-muted">No results.</li>
            )}
          </ul>
        </>
      )}
    </div>
  );
}
