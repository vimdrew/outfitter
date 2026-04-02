import { createFileRoute } from "@tanstack/react-router";

import { $getClothingItems } from "@/lib/wardrobe/functions";

export const Route = createFileRoute("/_auth/wardrobe")({
  loader: async ({ context }) => {
    const items = await $getClothingItems({ data: {} });
    return { items, user: context.user };
  },
});
