"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import type { PokemonCardData } from "./pokemon-card";
import { PokemonGrid } from "./pokemon-grid";
import { PokemonCardSkeleton } from "./pokemon-card";
import { TypeChip } from "./type-chip";
import {
  ALL_TYPES,
  GENERATIONS,
  generationForId,
  typeStyles,
} from "@/lib/type-colors";
import { formatPokemonName } from "@/lib/pokeapi";
import type { DirectoryEntry, PokemonType } from "@/lib/types";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 30;

interface Props {
  initialItems: PokemonCardData[];
  initialOffset: number;
  total: number;
  directory: DirectoryEntry[];
}

export function DirectoryClient({
  initialItems,
  initialOffset,
  total,
  directory,
}: Props) {
  // Browse-mode (no search): paginate via API.
  const [browseItems, setBrowseItems] = useState<PokemonCardData[]>(initialItems);
  const [offset, setOffset] = useState(initialOffset);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([]);
  const [selectedGens, setSelectedGens] = useState<number[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);

  // Search results (hydrated on demand from API)
  const [searchItems, setSearchItems] = useState<PokemonCardData[]>([]);
  const [searching, startSearch] = useTransition();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim().toLowerCase()), 180);
    return () => clearTimeout(t);
  }, [query]);

  const filtersActive =
    debounced.length > 0 || selectedTypes.length > 0 || selectedGens.length > 0;

  // When only type filters are active (no text, no gen), pull IDs from the
  // type API so we get the full set instead of a directory slice.
  const typeOnlyMode =
    selectedTypes.length > 0 && debounced.length === 0 && selectedGens.length === 0;

  // Compute id-set to fetch when in name/gen filter mode.
  const filteredIds = useMemo(() => {
    if (!filtersActive || typeOnlyMode) return null;
    let list = directory;
    if (debounced) list = list.filter((e) =>
      e.name.includes(debounced) ||
      formatPokemonName(e.name).toLowerCase().includes(debounced),
    );
    if (selectedGens.length > 0) {
      list = list.filter((e) => {
        const g = generationForId(e.id);
        return g ? selectedGens.includes(g.id) : false;
      });
    }
    return list.map((e) => e.id);
  }, [filtersActive, typeOnlyMode, directory, debounced, selectedGens]);

  // Fetch details for filtered ids (then filter by type client-side).
  useEffect(() => {
    if (typeOnlyMode) return; // handled by the effect below
    if (!filteredIds || filteredIds.length === 0) {
      setSearchItems([]);
      return;
    }
    const controller = new AbortController();
    startSearch(async () => {
      try {
        const chunks: number[][] = [];
        for (let i = 0; i < filteredIds.length; i += 40) {
          chunks.push(filteredIds.slice(i, i + 40));
        }
        const responses = await Promise.all(
          chunks.map((c) =>
            fetch(`/api/pokemon/by-id?ids=${c.join(",")}`, {
              signal: controller.signal,
            }).then((r) => r.json() as Promise<{ items: PokemonCardData[] }>),
          ),
        );
        const order = new Map(filteredIds.map((id, i) => [id, i]));
        let items = responses
          .flatMap((r) => r.items)
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        if (selectedTypes.length > 0) {
          items = items.filter((p) =>
            p.types.some((t) => selectedTypes.includes(t as PokemonType)),
          );
        }
        setSearchItems(items);
      } catch {
        /* aborted */
      }
    });
    return () => controller.abort();
  }, [filteredIds, selectedTypes, typeOnlyMode]);

  // Type-only mode: fetch IDs from the type API, then hydrate cards.
  useEffect(() => {
    if (!typeOnlyMode) return;
    const controller = new AbortController();
    startSearch(async () => {
      try {
        const res = await fetch(
          `/api/pokemon/by-type?types=${selectedTypes.join(",")}`,
          { signal: controller.signal },
        );
        const { ids } = (await res.json()) as { ids: number[] };
        if (ids.length === 0) { setSearchItems([]); return; }
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
        const items = responses
          .flatMap((r) => r.items)
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
        setSearchItems(items);
      } catch {
        /* aborted */
      }
    });
    return () => controller.abort();
  }, [typeOnlyMode, selectedTypes]);

  // Infinite scroll for browse mode
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMore = useCallback(async () => {
    if (loadingMore || browseItems.length >= total) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/pokemon?limit=${PAGE_SIZE}&offset=${offset}`,
      );
      const data = (await res.json()) as { items: PokemonCardData[] };
      setBrowseItems((cur) => [...cur, ...data.items]);
      setOffset((o) => o + PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, browseItems.length, total, offset]);

  useEffect(() => {
    if (filtersActive) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore, filtersActive]);

  const clearFilters = () => {
    setQuery("");
    setSelectedTypes([]);
    setSelectedGens([]);
  };

  const displayItems = filtersActive ? searchItems : browseItems;

  return (
    <div className="flex flex-col gap-4">
      <header className="sticky top-0 z-30 -mx-4 border-b border-border/60 bg-background/85 px-4 pt-3 pb-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <label className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              type="search"
              inputMode="search"
              autoComplete="off"
              placeholder="Search Pokémon"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cn(
                "h-11 w-full rounded-full border border-border/70 bg-surface pl-9 pr-9 text-base",
                "placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent",
              )}
              aria-label="Search Pokémon by name"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-surface-muted"
              >
                <X size={14} />
              </button>
            )}
          </label>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label="Open filters"
            className={cn(
              "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border/70 bg-surface",
              "hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
            )}
          >
            <SlidersHorizontal size={18} />
            {(selectedTypes.length + selectedGens.length) > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                {selectedTypes.length + selectedGens.length}
              </span>
            )}
          </button>
        </div>

        {filtersActive && (
          <div className="mx-auto mt-2 flex max-w-6xl flex-wrap items-center gap-1.5">
            {selectedTypes.map((t) => (
              <button
                key={t}
                onClick={() =>
                  setSelectedTypes((cur) => cur.filter((x) => x !== t))
                }
                className="inline-flex items-center gap-1"
                aria-label={`Remove ${t} filter`}
              >
                <TypeChip type={t} />
                <X size={12} className="text-muted" />
              </button>
            ))}
            {selectedGens.map((g) => {
              const gen = GENERATIONS.find((x) => x.id === g);
              if (!gen) return null;
              return (
                <button
                  key={g}
                  onClick={() =>
                    setSelectedGens((cur) => cur.filter((x) => x !== g))
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium"
                >
                  {gen.label} · {gen.region}
                  <X size={12} className="text-muted" />
                </button>
              );
            })}
            <button
              onClick={clearFilters}
              className="ml-1 text-[11px] font-medium text-muted underline-offset-4 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </header>

      <section aria-live="polite" className="mx-auto w-full max-w-6xl">
        {filtersActive && !searching && displayItems.length > 0 && (
          <p className="mb-3 text-xs text-muted">
            {displayItems.length} Pokémon
          </p>
        )}
        {filtersActive && searching && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <PokemonCardSkeleton key={i} />
            ))}
          </div>
        )}
        {filtersActive && !searching && displayItems.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/70 p-10 text-center">
            <p className="text-sm font-medium">No Pokémon match.</p>
            <p className="text-xs text-muted">
              Try a different name or remove a filter.
            </p>
          </div>
        )}
        {displayItems.length > 0 && <PokemonGrid items={displayItems} />}

        {!filtersActive && (
          <>
            <div ref={sentinelRef} className="h-1" />
            {loadingMore && (
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <PokemonCardSkeleton key={i} />
                ))}
              </div>
            )}
            {browseItems.length >= total && (
              <p className="py-6 text-center text-xs text-muted">
                That&apos;s every Pokémon.
              </p>
            )}
          </>
        )}
      </section>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedTypes={selectedTypes}
        selectedGens={selectedGens}
        onToggleType={(t) =>
          setSelectedTypes((cur) =>
            cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t],
          )
        }
        onToggleGen={(g) =>
          setSelectedGens((cur) =>
            cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g],
          )
        }
        onClear={clearFilters}
      />
    </div>
  );
}

function FilterSheet({
  open,
  onClose,
  selectedTypes,
  selectedGens,
  onToggleType,
  onToggleGen,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  selectedTypes: PokemonType[];
  selectedGens: number[];
  onToggleType: (t: PokemonType) => void;
  onToggleGen: (g: number) => void;
  onClear: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
      <button
        aria-label="Close filters"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-border/70 bg-surface",
          "sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl",
          "fade-in",
        )}
      >
        <div className="px-5 pt-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border sm:hidden" />
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base font-semibold">Filters</h2>
            <button
              onClick={onClear}
              className="text-xs font-medium text-muted underline-offset-4 hover:underline"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-2">

        <section className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Type
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TYPES.map((t) => {
              const active = selectedTypes.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => onToggleType(t)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition",
                    active
                      ? typeStyles[t].chip
                      : "border border-border/70 bg-surface text-foreground hover:bg-surface-muted",
                  )}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mb-6">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
            Generation
          </h3>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {GENERATIONS.map((g) => {
              const active = selectedGens.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onToggleGen(g.id)}
                  aria-pressed={active}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-xs transition",
                    active
                      ? "border-accent bg-accent/10 text-foreground"
                      : "border-border/70 bg-surface hover:bg-surface-muted",
                  )}
                >
                  <div className="font-semibold">{g.label}</div>
                  <div className="text-[11px] text-muted">{g.region}</div>
                </button>
              );
            })}
          </div>
        </section>

        </div>

        <div className="border-t border-border/60 bg-surface p-4 pb-safe">
          <button
            onClick={onClose}
            className="h-11 w-full rounded-full bg-foreground text-sm font-medium text-background hover:opacity-90"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}
