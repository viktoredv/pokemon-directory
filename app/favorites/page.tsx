import { FavoritesClient } from "@/components/favorites-client";

export const metadata = { title: "Favorites · Pokédex" };

export default function FavoritesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-3 pb-8">
      <div className="mb-3">
        <h1 className="text-2xl font-bold tracking-tight">Favorites</h1>
        <p className="text-sm text-muted">Your saved Pokémon.</p>
      </div>
      <FavoritesClient />
    </main>
  );
}
