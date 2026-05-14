import type { PokemonType } from "./types";

// Surface tint (subtle bg), chip bg, chip text. AA-friendly.
export const typeStyles: Record<
  PokemonType,
  { tint: string; chip: string; ring: string; from: string; to: string }
> = {
  normal:   { tint: "bg-zinc-100 dark:bg-zinc-800/50",       chip: "bg-zinc-200 text-zinc-900 dark:bg-zinc-700 dark:text-zinc-100",       ring: "ring-zinc-300",   from: "from-zinc-200",   to: "to-zinc-100" },
  fire:     { tint: "bg-orange-100 dark:bg-orange-950/40",   chip: "bg-orange-500 text-white",                                            ring: "ring-orange-300", from: "from-orange-200", to: "to-amber-100" },
  water:    { tint: "bg-sky-100 dark:bg-sky-950/40",         chip: "bg-sky-500 text-white",                                               ring: "ring-sky-300",    from: "from-sky-200",    to: "to-blue-100" },
  electric: { tint: "bg-yellow-100 dark:bg-yellow-950/40",   chip: "bg-yellow-400 text-yellow-950",                                       ring: "ring-yellow-300", from: "from-yellow-200", to: "to-amber-100" },
  grass:    { tint: "bg-emerald-100 dark:bg-emerald-950/40", chip: "bg-emerald-500 text-white",                                           ring: "ring-emerald-300",from: "from-emerald-200",to: "to-lime-100" },
  ice:      { tint: "bg-cyan-100 dark:bg-cyan-950/40",       chip: "bg-cyan-400 text-cyan-950",                                           ring: "ring-cyan-300",   from: "from-cyan-200",   to: "to-sky-100" },
  fighting: { tint: "bg-red-100 dark:bg-red-950/40",         chip: "bg-red-600 text-white",                                               ring: "ring-red-300",    from: "from-red-200",    to: "to-orange-100" },
  poison:   { tint: "bg-purple-100 dark:bg-purple-950/40",   chip: "bg-purple-500 text-white",                                            ring: "ring-purple-300", from: "from-purple-200", to: "to-fuchsia-100" },
  ground:   { tint: "bg-amber-100 dark:bg-amber-950/40",     chip: "bg-amber-600 text-white",                                             ring: "ring-amber-300",  from: "from-amber-200",  to: "to-yellow-100" },
  flying:   { tint: "bg-indigo-100 dark:bg-indigo-950/40",   chip: "bg-indigo-400 text-white",                                            ring: "ring-indigo-300", from: "from-indigo-200", to: "to-sky-100" },
  psychic:  { tint: "bg-pink-100 dark:bg-pink-950/40",       chip: "bg-pink-500 text-white",                                              ring: "ring-pink-300",   from: "from-pink-200",   to: "to-rose-100" },
  bug:      { tint: "bg-lime-100 dark:bg-lime-950/40",       chip: "bg-lime-500 text-lime-950",                                           ring: "ring-lime-300",   from: "from-lime-200",   to: "to-green-100" },
  rock:     { tint: "bg-stone-100 dark:bg-stone-800/50",     chip: "bg-stone-500 text-white",                                             ring: "ring-stone-300",  from: "from-stone-200",  to: "to-amber-100" },
  ghost:    { tint: "bg-violet-100 dark:bg-violet-950/40",   chip: "bg-violet-600 text-white",                                            ring: "ring-violet-300", from: "from-violet-200", to: "to-indigo-100" },
  dragon:   { tint: "bg-indigo-100 dark:bg-indigo-950/40",   chip: "bg-indigo-700 text-white",                                            ring: "ring-indigo-400", from: "from-indigo-300", to: "to-violet-200" },
  dark:     { tint: "bg-neutral-200 dark:bg-neutral-800/60", chip: "bg-neutral-800 text-white",                                           ring: "ring-neutral-400",from: "from-neutral-300",to: "to-zinc-200" },
  steel:    { tint: "bg-slate-100 dark:bg-slate-800/50",     chip: "bg-slate-500 text-white",                                             ring: "ring-slate-300",  from: "from-slate-200",  to: "to-zinc-100" },
  fairy:    { tint: "bg-rose-100 dark:bg-rose-950/40",       chip: "bg-rose-400 text-white",                                              ring: "ring-rose-300",   from: "from-rose-200",   to: "to-pink-100" },
};

export const ALL_TYPES: PokemonType[] = [
  "normal","fire","water","electric","grass","ice","fighting","poison","ground",
  "flying","psychic","bug","rock","ghost","dragon","dark","steel","fairy",
];

export interface Generation {
  id: number;
  label: string;
  region: string;
  range: [number, number];
}

export const GENERATIONS: Generation[] = [
  { id: 1, label: "Gen I",   region: "Kanto",   range: [1, 151] },
  { id: 2, label: "Gen II",  region: "Johto",   range: [152, 251] },
  { id: 3, label: "Gen III", region: "Hoenn",   range: [252, 386] },
  { id: 4, label: "Gen IV",  region: "Sinnoh",  range: [387, 493] },
  { id: 5, label: "Gen V",   region: "Unova",   range: [494, 649] },
  { id: 6, label: "Gen VI",  region: "Kalos",   range: [650, 721] },
  { id: 7, label: "Gen VII", region: "Alola",   range: [722, 809] },
  { id: 8, label: "Gen VIII",region: "Galar",   range: [810, 905] },
  { id: 9, label: "Gen IX",  region: "Paldea",  range: [906, 1025] },
];

export function generationForId(id: number): Generation | undefined {
  return GENERATIONS.find((g) => id >= g.range[0] && id <= g.range[1]);
}
