import { createFileRoute } from "@tanstack/react-router";

import { $getOutfits } from "@/lib/wardrobe/functions";

export const Route = createFileRoute("/_auth/outfit/$outfitId")({
  loader: async ({ params }) => {
    const outfits = await $getOutfits();
    const outfit = outfits.find((o) => o.id === params.outfitId);
    if (!outfit) {
      throw new Error("Outfit not found");
    }
    return { outfit, items: outfit.items };
  },
});
