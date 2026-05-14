import type {
  DirectoryEntry,
  EvolutionChain,
  Pokemon,
  PokemonListResponse,
  PokemonSpecies,
  TypeInfo,
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

export async function getType(name: string): Promise<TypeInfo> {
  return api<TypeInfo>(`/type/${name}`);
}

/** Full name+id directory: base forms + mega/gmax forms. */
export async function getDirectory(): Promise<DirectoryEntry[]> {
  const data = await api<PokemonListResponse>(`/pokemon?limit=2000&offset=0`);
  return data.results
    .map((r) => ({ id: idFromUrl(r.url), name: r.name }))
    .filter((e) => {
      if (e.id <= 0) return false;
      if (e.id < 10000) return true;
      return /(?:^|-)(mega|gmax)(?:-|$)/.test(e.name);
    });
}

export function formatPokemonName(name: string): string {
  const parts = name.split("-");
  // Move "mega" or "gmax" to the front: "charizard-mega-x" → "Mega Charizard X"
  const specialIdx = parts.findIndex((p) => p === "mega" || p === "gmax");
  if (specialIdx > 0) {
    const [special] = parts.splice(specialIdx, 1);
    parts.unshift(special);
  }
  return parts
    .map((p) => (p === "gmax" ? "GMax" : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(" ");
}

export function paddedId(id: number): string {
  return "#" + String(id).padStart(4, "0");
}
