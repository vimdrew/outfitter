import { createFileRoute } from "@tanstack/react-router";

import { $getOutfits } from "@/lib/wardrobe/functions";

export const Route = createFileRoute("/_auth/outfits")({
  loader: async () => {
    const outfits = await $getOutfits();
    return { outfits };
  },
});
