"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useFavorites } from "@/lib/use-favorites";
import { PokemonGrid } from "./pokemon-grid";
import { PokemonCardSkeleton } from "./pokemon-card";
import type { PokemonCardData } from "./pokemon-card";

export function FavoritesClient() {
  const ids = useFavorites((s) => s.ids);
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<PokemonCardData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    if (ids.length === 0) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/pokemon/by-id?ids=${ids.join(",")}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data: { items: PokemonCardData[] }) => {
        const order = new Map(ids.map((id, i) => [id, i]));
        const sorted = [...data.items].sort(
          (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0),
        );
        setItems(sorted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [ids, mounted]);

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border/70 px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted">
          <Heart size={24} className="text-muted" />
        </div>
        <div>
          <p className="text-sm font-semibold">No favorites yet</p>
          <p className="mt-1 text-xs text-muted">
            Tap the heart on a Pokémon to save it here.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background hover:opacity-90"
        >
          Browse Pokédex
        </Link>
      </div>
    );
  }

  if (loading && items.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: Math.min(ids.length, 6) }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return <PokemonGrid items={items} />;
}
