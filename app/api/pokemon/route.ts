import { NextResponse } from "next/server";
import { getPokemon, getPokemonList, idFromUrl } from "@/lib/pokeapi";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") ?? 30), 60);
  const offset = Math.max(Number(searchParams.get("offset") ?? 0), 0);

  const list = await getPokemonList(limit, offset);
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
        types: p.types.map((t) => t.type.name),
      };
    }),
  );

  return NextResponse.json({ items: details, count: list.count });
}
