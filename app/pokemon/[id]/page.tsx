import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import {
  artworkUrl,
  formatPokemonName,
  getEvolutionChain,
  getPokemon,
  getSpecies,
  getType,
  idFromUrl,
  paddedId,
} from "@/lib/pokeapi";
import type { EvolutionLink, PokemonType, TypeInfo } from "@/lib/types";
import {
  ALL_TYPES,
  generationForId,
  GENERATIONS,
  typeStyles,
} from "@/lib/type-colors";
import { TypeChip } from "@/components/type-chip";
import { TypeChipButton } from "@/components/type-chip-button";
import { StatBar } from "@/components/stat-bar";
import { DetailTabs } from "@/components/detail-tabs";
import { FavoriteButton } from "@/components/favorite-button";
import { MatchupSection } from "@/components/matchup-section";
import { cn } from "@/lib/cn";

interface PageProps {
  params: Promise<{ id: string }>;
}

function flattenChain(link: EvolutionLink): { name: string; id: number }[] {
  const out: { name: string; id: number }[] = [];
  const walk = (l: EvolutionLink) => {
    out.push({ name: l.species.name, id: idFromUrl(l.species.url) });
    l.evolves_to.forEach(walk);
  };
  walk(link);
  return out;
}

export default async function PokemonDetailPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId < 1) notFound();

  let pokemon: Awaited<ReturnType<typeof getPokemon>>;
  let species: Awaited<ReturnType<typeof getSpecies>>;
  try {
    pokemon = await getPokemon(numericId);
    species = await getSpecies(pokemon.species.name);
  } catch {
    notFound();
  }

  const primary = pokemon.types[0].type.name as PokemonType;
  const tint = typeStyles[primary];

  const evolutionChainId = idFromUrl(species.evolution_chain.url);
  let evolutions: { name: string; id: number }[] = [];
  try {
    const chain = await getEvolutionChain(evolutionChainId);
    evolutions = flattenChain(chain.chain);
  } catch {}

  const flavor = species.flavor_text_entries.find(
    (e) => e.language.name === "en",
  );
  const genus = species.genera.find((g) => g.language.name === "en")?.genus;

  // Use species' generation (works for mega forms whose id > 10000).
  const speciesGenId = idFromUrl(species.generation.url);
  const gen = generationForId(species.id) ?? GENERATIONS.find((g) => g.id === speciesGenId);

  // Alternate forms (mega, gmax, etc.) — non-default varieties of this species.
  const altVarieties = species.varieties.filter(
    (v) => !v.is_default && idFromUrl(v.pokemon.url) !== pokemon.id,
  );
  const forms = await Promise.all(
    altVarieties.map(async (v) => {
      try {
        const p = await getPokemon(idFromUrl(v.pokemon.url));
        return {
          id: p.id,
          name: p.name,
          types: p.types.map((t) => t.type.name as PokemonType),
        };
      } catch {
        return null;
      }
    }),
  ).then((r) => r.filter((x): x is { id: number; name: string; types: PokemonType[] } => x !== null));

  // Fetch every type's matchup data once.
  const allTypeInfos = (await Promise.all(
    ALL_TYPES.map((t) => getType(t).catch(() => null)),
  )).filter((t): t is TypeInfo => t !== null);
  const typeInfoByName = new Map(allTypeInfos.map((t) => [t.name, t]));

  // Build a map of every known base-form pokémon → its full type list.
  const pokemonInfoMap = new Map<number, { name: string; types: PokemonType[] }>();
  for (const typeInfo of allTypeInfos) {
    for (const entry of typeInfo.pokemon) {
      const pid = idFromUrl(entry.pokemon.url);
      if (pid <= 0 || pid >= 10000) continue;
      const existing = pokemonInfoMap.get(pid);
      if (existing) existing.types.push(typeInfo.name);
      else pokemonInfoMap.set(pid, { name: entry.pokemon.name, types: [typeInfo.name] });
    }
  }

  // Max effectiveness of attackerTypes against a defender with defenderTypes.
  // Uses the best available move (highest multiplier across attacker types).
  function maxEffectiveness(attackerTypes: PokemonType[], defenderTypes: PokemonType[]): number {
    let best = 0;
    for (const atk of attackerTypes) {
      const info = typeInfoByName.get(atk);
      if (!info) continue;
      let m = 1;
      for (const def of defenderTypes) {
        if (info.damage_relations.double_damage_to.some((r) => r.name === def)) m *= 2;
        else if (info.damage_relations.half_damage_to.some((r) => r.name === def)) m *= 0.5;
        else if (info.damage_relations.no_damage_to.some((r) => r.name === def)) m *= 0;
      }
      if (m > best) best = m;
    }
    return best;
  }

  const viewerTypes = pokemon.types.map((t) => t.type.name as PokemonType);

  type MatchupEntry = { id: number; name: string; types: PokemonType[] };

  function matchupList(predicate: (targetTypes: PokemonType[]) => boolean): MatchupEntry[] {
    const out: MatchupEntry[] = [];
    for (const [pid, info] of pokemonInfoMap) {
      if (pid === pokemon.id) continue;
      if (predicate(info.types)) out.push({ id: pid, name: info.name, types: info.types });
    }
    return out.sort((a, b) => a.id - b.id);
  }

  // Strong against: viewer can deal 2× or more to the target.
  const strongAgainstPokemon = matchupList(
    (def) => maxEffectiveness(viewerTypes, def) >= 2,
  );
  // Weak against: target can deal 2× or more to the viewer.
  const weakAgainstPokemon = matchupList(
    (atk) => maxEffectiveness(atk, viewerTypes) >= 2,
  );
  // Doesn't take damage from: target deals 0× to the viewer.
  const immuneFromPokemon = matchupList(
    (atk) => maxEffectiveness(atk, viewerTypes) === 0,
  );
  // Doesn't give damage to: viewer deals 0× to the target.
  const ineffectiveAgainstPokemon = matchupList(
    (def) => maxEffectiveness(viewerTypes, def) === 0,
  );

  return (
    <main className="flex-1 pb-8">
      <section
        className={cn(
          "relative overflow-hidden bg-gradient-to-br pb-3 pt-3 text-zinc-900",
          tint.from,
          tint.to,
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-4 -bottom-6 text-[140px] font-black leading-none text-white/25 select-none tabular sm:text-[180px]"
        >
          {paddedId(pokemon.id).replace("#", "")}
        </span>

        <div className="mx-auto flex max-w-3xl items-center justify-between px-4">
          <Link
            href="/"
            aria-label="Back to directory"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/40 backdrop-blur transition hover:bg-white/60"
          >
            <ChevronLeft size={20} />
          </Link>
          <FavoriteButton id={pokemon.id} size="md" />
        </div>

        <div className="relative mx-auto mt-1 max-w-3xl px-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="tabular text-xs font-semibold text-zinc-900/60">
                {paddedId(pokemon.id)}
              </p>
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {formatPokemonName(pokemon.name)}
              </h1>
              {genus && (
                <p className="mt-0.5 text-xs text-zinc-900/70">{genus}</p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {pokemon.types.map((t) => (
                  <TypeChipButton
                    key={t.type.name}
                    type={t.type.name as PokemonType}
                    size="md"
                  />
                ))}
              </div>
            </div>
            <div className="relative h-32 w-32 shrink-0 sm:h-40 sm:w-40">
              <Image
                src={artworkUrl(pokemon.id)}
                alt={formatPokemonName(pokemon.name)}
                fill
                sizes="(max-width: 640px) 128px, 160px"
                className="object-contain drop-shadow-2xl fade-in"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4">
        <DetailTabs
          tabs={[
            {
              id: "about",
              label: "About",
              content: (
                <div className="space-y-4">
                  {flavor && (
                    <p className="text-sm leading-relaxed text-foreground/85">
                      {flavor.flavor_text.replace(/\f|\n/g, " ")}
                    </p>
                  )}
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-2xl border border-border/60 bg-surface p-4 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Height</dt>
                      <dd className="font-medium tabular">
                        {(pokemon.height / 10).toFixed(1)} m
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Weight</dt>
                      <dd className="font-medium tabular">
                        {(pokemon.weight / 10).toFixed(1)} kg
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Base XP</dt>
                      <dd className="font-medium tabular">
                        {pokemon.base_experience ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Generation</dt>
                      <dd className="font-medium">
                        {gen ? `${gen.label} · ${gen.region}` : "—"}
                      </dd>
                    </div>
                    <div className="col-span-2">
                      <dt className="text-xs text-muted">Abilities</dt>
                      <dd className="mt-1 flex flex-wrap gap-1.5">
                        {pokemon.abilities.map((a) => (
                          <span
                            key={a.ability.name}
                            className={cn(
                              "rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium capitalize",
                              a.is_hidden && "italic text-muted",
                            )}
                          >
                            {a.ability.name.replace("-", " ")}
                            {a.is_hidden && " · hidden"}
                          </span>
                        ))}
                      </dd>
                    </div>
                  </dl>

                  <MatchupSection
                    title="Strong against"
                    hint="2× damage"
                    items={strongAgainstPokemon}
                  />
                  <MatchupSection
                    title="Weak against"
                    hint="takes 2× damage"
                    items={weakAgainstPokemon}
                  />
                  <MatchupSection
                    title="Doesn't take damage from"
                    hint="0× damage"
                    items={immuneFromPokemon}
                  />
                  <MatchupSection
                    title="Doesn't give damage to"
                    hint="0× damage"
                    items={ineffectiveAgainstPokemon}
                  />
                </div>
              ),
            },
            {
              id: "stats",
              label: "Stats",
              content: (
                <div className="space-y-3 rounded-2xl border border-border/60 bg-surface p-4">
                  {pokemon.stats.map((s) => (
                    <StatBar
                      key={s.stat.name}
                      name={s.stat.name}
                      value={s.base_stat}
                      accentClass={tint.chip.split(" ")[0]}
                    />
                  ))}
                  <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                    <span className="text-muted">Total</span>
                    <span className="tabular font-semibold">
                      {pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0)}
                    </span>
                  </div>
                </div>
              ),
            },
            {
              id: "evolution",
              label: "Evolution",
              content: evolutions.length > 1 ? (
                <ol className="flex flex-wrap items-center gap-3">
                  {evolutions.map((e, i) => (
                    <li key={e.id} className="flex items-center gap-3">
                      <Link
                        href={`/pokemon/${e.id}`}
                        className="flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-surface p-3 transition hover:shadow-md"
                      >
                        <div className="relative h-20 w-20">
                          <Image
                            src={artworkUrl(e.id)}
                            alt={formatPokemonName(e.name)}
                            fill
                            sizes="80px"
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <span className="text-xs font-medium capitalize">
                          {formatPokemonName(e.name)}
                        </span>
                      </Link>
                      {i < evolutions.length - 1 && (
                        <span className="text-muted" aria-hidden>
                          →
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-muted">
                  This Pokémon does not evolve.
                </p>
              ),
            },
            ...(forms.length > 0
              ? [
                  {
                    id: "forms",
                    label: "Forms",
                    content: (
                      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {forms.map((f) => (
                          <li key={f.id}>
                            <Link
                              href={`/pokemon/${f.id}`}
                              className={cn(
                                "flex flex-col items-center gap-1 rounded-2xl border border-border/60 bg-gradient-to-br p-3 text-zinc-900 transition hover:shadow-md",
                                typeStyles[f.types[0] ?? "normal"].from,
                                typeStyles[f.types[0] ?? "normal"].to,
                              )}
                            >
                              <div className="relative h-24 w-24">
                                <Image
                                  src={artworkUrl(f.id)}
                                  alt={formatPokemonName(f.name)}
                                  fill
                                  sizes="96px"
                                  className="object-contain drop-shadow-md"
                                  unoptimized
                                />
                              </div>
                              <span className="text-center text-xs font-semibold">
                                {formatPokemonName(f.name)}
                              </span>
                              <div className="flex flex-wrap justify-center gap-1">
                                {f.types.map((t) => (
                                  <TypeChip key={t} type={t} />
                                ))}
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </section>
    </main>
  );
}

