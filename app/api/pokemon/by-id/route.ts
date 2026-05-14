import { NextResponse } from "next/server";
import { getPokemon } from "@/lib/pokeapi";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get("ids") ?? "";
  const ids = idsParam
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0 && n < 10000)
    .slice(0, 40);

  if (ids.length === 0) return NextResponse.json({ items: [] });

  const items = await Promise.all(
    ids.map(async (id) => {
      try {
        const p = await getPokemon(id);
        return { id: p.id, name: p.name, types: p.types.map((t) => t.type.name) };
      } catch {
        return null;
      }
    }),
  );

  return NextResponse.json({ items: items.filter(Boolean) });
}
