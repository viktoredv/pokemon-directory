import { NextResponse } from "next/server";
import { getType, idFromUrl } from "@/lib/pokeapi";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const typesParam = searchParams.get("types") ?? searchParams.get("type") ?? "";
  const typeNames = typesParam
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 5);

  if (typeNames.length === 0) return NextResponse.json({ ids: [] });

  const results = await Promise.all(typeNames.map((t) => getType(t).catch(() => null)));

  const seen = new Set<number>();
  const ids: number[] = [];
  for (const info of results) {
    if (!info) continue;
    for (const entry of info.pokemon) {
      const id = idFromUrl(entry.pokemon.url);
      if (id > 0 && id < 10000 && !seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
  }
  ids.sort((a, b) => a - b);

  return NextResponse.json({ ids });
}
