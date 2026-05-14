import Image from "next/image";
import Link from "next/link";
import {
  artworkUrl,
  formatPokemonName,
  paddedId,
} from "@/lib/pokeapi";
import type { PokemonType } from "@/lib/types";
import { typeStyles } from "@/lib/type-colors";
import { TypeChip } from "./type-chip";
import { FavoriteButton } from "./favorite-button";
import { cn } from "@/lib/cn";

export interface PokemonCardData {
  id: number;
  name: string;
  types: PokemonType[];
}

export function PokemonCard({
  pokemon,
  priority = false,
}: {
  pokemon: PokemonCardData;
  priority?: boolean;
}) {
  const primary = pokemon.types[0] ?? "normal";
  const tint = typeStyles[primary];

  return (
    <Link
      href={`/pokemon/${pokemon.id}`}
      prefetch={false}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-border/60",
        "bg-surface transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-border",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        "fade-in",
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden",
          "bg-gradient-to-br",
          tint.from,
          tint.to,
        )}
      >
        <span
          aria-hidden
          className="absolute -right-6 -top-6 text-[88px] font-black leading-none text-white/40 select-none tabular"
        >
          {paddedId(pokemon.id).replace("#", "")}
        </span>
        <Image
          src={artworkUrl(pokemon.id)}
          alt={formatPokemonName(pokemon.name)}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
          className="object-contain p-3 drop-shadow-md transition-transform duration-300 group-hover:scale-105"
          priority={priority}
          unoptimized
        />
        <div className="absolute right-2 top-2">
          <FavoriteButton id={pokemon.id} size="sm" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-muted tabular">
            {paddedId(pokemon.id)}
          </span>
        </div>
        <h3 className="truncate text-sm font-semibold tracking-tight">
          {formatPokemonName(pokemon.name)}
        </h3>
        <div className="flex flex-wrap gap-1">
          {pokemon.types.map((t) => (
            <TypeChip key={t} type={t} />
          ))}
        </div>
      </div>
    </Link>
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col overflow-hidden rounded-[var(--radius-card)] border border-border/60 bg-surface">
      <div className="aspect-square w-full bg-surface-muted" />
      <div className="space-y-2 p-3">
        <div className="h-3 w-10 rounded bg-surface-muted" />
        <div className="h-4 w-24 rounded bg-surface-muted" />
        <div className="flex gap-1">
          <div className="h-4 w-12 rounded-full bg-surface-muted" />
          <div className="h-4 w-12 rounded-full bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
