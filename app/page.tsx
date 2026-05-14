import { DirectoryClient } from "@/components/directory-client";
import {
  getDirectory,
  getPokemon,
  getPokemonList,
  idFromUrl,
} from "@/lib/pokeapi";
import type { PokemonType } from "@/lib/types";

const INITIAL_PAGE = 30;

export default async function Home() {
  const [list, directory] = await Promise.all([
    getPokemonList(INITIAL_PAGE, 0),
    getDirectory(),
  ]);

  const ids = list.results
    .map((r) => idFromUrl(r.url))
    .filter((id) => id > 0 && id < 10000);

  const details = await Promise.all(
    ids.map(async (id) => {
      const p = await getPokemon(id);
      return {
        id: p.id,
        speciesId: idFromUrl(p.species.url),
        name: p.name,
        types: p.types.map((t) => t.type.name as PokemonType),
      };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-2 pb-8">
      <div className="mx-auto mb-3 max-w-6xl">
        <h1 className="text-2xl font-bold tracking-tight">Pokédex</h1>
        <p className="text-sm text-muted">
          Browse {directory.length.toLocaleString()} Pokémon.
        </p>
      </div>
      <DirectoryClient
        initialItems={details}
        initialOffset={INITIAL_PAGE}
        total={list.count}
        directory={directory}
      />
    </main>
  );
}
