import type {
  DirectoryEntry,
  EvolutionChain,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
} from "./types";

const BASE = "https://pokeapi.co/api/v2";
const DAY = 60 * 60 * 24;

async function api<T>(path: string, revalidate: number = DAY): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate } });
  if (!res.ok) throw new Error(`PokeAPI ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

export function idFromUrl(url: string): number {
  const m = url.match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : 0;
}

export function artworkUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export function spriteUrl(id: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

export async function getPokemonList(
  limit: number,
  offset: number,
): Promise<PokemonListResponse> {
  return api<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
}

export async function getPokemon(idOrName: string | number): Promise<Pokemon> {
  return api<Pokemon>(`/pokemon/${idOrName}`);
}

export async function getSpecies(
  idOrName: string | number,
): Promise<PokemonSpecies> {
  return api<PokemonSpecies>(`/pokemon-species/${idOrName}`);
}

export async function getEvolutionChain(id: number): Promise<EvolutionChain> {
  return api<EvolutionChain>(`/evolution-chain/${id}`);
}

/** Full name+id directory, used for client-side search. ~1300 entries. */
export async function getDirectory(): Promise<DirectoryEntry[]> {
  const data = await api<PokemonListResponse>(`/pokemon?limit=1500&offset=0`);
  return data.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((e) => e.id > 0 && e.id < 10000);
}

export function formatPokemonName(name: string): string {
  return name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function paddedId(id: number): string {
  return "#" + String(id).padStart(4, "0");
}
