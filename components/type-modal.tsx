"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { artworkUrl, formatPokemonName } from "@/lib/pokeapi";
import type { PokemonType } from "@/lib/types";
import { typeStyles } from "@/lib/type-colors";
import { TypeChip } from "./type-chip";
import { cn } from "@/lib/cn";

interface PokemonCardData {
  id: number;
  name: string;
  types: string[];
}

interface Props {
  type: PokemonType;
  onClose: () => void;
}

export function TypeModal({ type, onClose }: Props) {
  const [items, setItems] = useState<PokemonCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setItems([]);
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`/api/pokemon/by-type?type=${type}`, {
          signal: controller.signal,
        });
        const { ids } = (await res.json()) as { ids: number[] };
        const chunks: number[][] = [];
        for (let i = 0; i < ids.length; i += 40) chunks.push(ids.slice(i, i + 40));
        const responses = await Promise.all(
          chunks.map((c) =>
            fetch(`/api/pokemon/by-id?ids=${c.join(",")}`, {
              signal: controller.signal,
            }).then((r) => r.json() as Promise<{ items: PokemonCardData[] }>),
          ),
        );
        const order = new Map(ids.map((id, i) => [id, i]));
        setItems(
          responses
            .flatMap((r) => r.items)
            .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)),
        );
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [type]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const tint = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`${type} type Pokémon`}>
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl",
          "sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
          "border border-border/60 bg-surface",
        )}
      >
        {/* Header */}
        <div className={cn("flex items-center justify-between rounded-t-3xl bg-gradient-to-r px-5 py-4 sm:rounded-t-3xl", tint.from, tint.to)}>
          <div>
            <p className="text-xs font-semibold capitalize text-zinc-900/60">{type} type</p>
            <p className="text-base font-bold text-zinc-900">
              {loading ? "Loading…" : `${items.length} Pokémon`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/10 transition hover:bg-black/20"
          >
            <X size={16} className="text-zinc-900" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center py-12 text-sm text-muted">
              Loading…
            </div>
          )}
          <ul className="divide-y divide-border/40">
            {items.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/pokemon/${p.id}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-surface-muted"
                >
                  <div
                    className={cn(
                      "relative h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br",
                      tint.from,
                      tint.to,
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
                  <span className="flex-1 text-sm font-medium">
                    {formatPokemonName(p.name)}
                  </span>
                  <div className="flex gap-1">
                    {p.types.map((t) => (
                      <TypeChip key={t} type={t as PokemonType} />
                    ))}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
