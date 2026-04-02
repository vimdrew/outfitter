import { createFileRoute } from "@tanstack/react-router";

import { $getClothingItems } from "@/lib/wardrobe/functions";

export const Route = createFileRoute("/_auth/outfits/new")({
  loader: async () => {
    const items = await $getClothingItems({ data: {} });
    return { items };
  },
});
