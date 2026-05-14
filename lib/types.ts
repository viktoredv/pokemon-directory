export type PokemonType =
  | "normal" | "fire" | "water" | "electric" | "grass" | "ice"
  | "fighting" | "poison" | "ground" | "flying" | "psychic" | "bug"
  | "rock" | "ghost" | "dragon" | "dark" | "steel" | "fairy";

export interface NamedRef {
  name: string;
  url: string;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: NamedRef;
}

export interface PokemonAbility {
  ability: NamedRef;
  is_hidden: boolean;
  slot: number;
}

export interface PokemonTypeSlot {
  slot: number;
  type: { name: PokemonType; url: string };
}

export interface PokemonSprites {
  front_default: string | null;
  other: {
    "official-artwork": { front_default: string | null };
    home: { front_default: string | null };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
  abilities: PokemonAbility[];
  sprites: PokemonSprites;
  species: NamedRef;
  moves: { move: NamedRef }[];
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedRef;
  version: NamedRef;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  generation: NamedRef;
  flavor_text_entries: FlavorTextEntry[];
  evolution_chain: { url: string };
  genera: { genus: string; language: NamedRef }[];
  color: NamedRef;
  varieties: { is_default: boolean; pokemon: NamedRef }[];
}

export interface EvolutionDetail {
  trigger: NamedRef;
  item: NamedRef | null;
  held_item: NamedRef | null;
  min_level: number | null;
  min_happiness: number | null;
  min_affection: number | null;
  min_beauty: number | null;
  known_move: NamedRef | null;
  known_move_type: NamedRef | null;
  location: NamedRef | null;
  time_of_day: string;
  gender: number | null;
  needs_overworld_rain: boolean;
  turn_upside_down: boolean;
}

export interface EvolutionLink {
  species: NamedRef;
  evolves_to: EvolutionLink[];
  evolution_details: EvolutionDetail[];
  is_baby: boolean;
}

export interface EvolutionChain {
  id: number;
  chain: EvolutionLink;
}

export interface TypeInfo {
  name: PokemonType;
  damage_relations: {
    double_damage_to: { name: PokemonType }[];
    half_damage_to: { name: PokemonType }[];
    no_damage_to: { name: PokemonType }[];
    double_damage_from: { name: PokemonType }[];
    half_damage_from: { name: PokemonType }[];
    no_damage_from: { name: PokemonType }[];
  };
  pokemon: { slot: number; pokemon: NamedRef }[];
}

export interface DirectoryEntry {
  id: number;
  name: string;
}
