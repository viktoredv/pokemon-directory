import { PokemonCard, type PokemonCardData } from "./pokemon-card";

export function PokemonGrid({
  items,
  priorityCount = 6,
}: {
  items: PokemonCardData[];
  priorityCount?: number;
}) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((p, i) => (
        <li key={p.id}>
          <PokemonCard pokemon={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
