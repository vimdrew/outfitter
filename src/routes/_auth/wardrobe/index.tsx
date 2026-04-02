import { createFileRoute } from "@tanstack/react-router";

import { $getClothingItems } from "@/lib/wardrobe/functions";
import type { ClothingItemWithDetails } from "@/lib/wardrobe/types";

export const Route = createFileRoute("/_auth/wardrobe/")({
  component: WardrobePage,
});

function WardrobePage() {
  const loaderData = Route.useLoaderData() as { items?: ClothingItemWithDetails[] } | undefined;
  const { items } = loaderData ?? {};
  return <WardrobeContent initialItems={items} />;
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { WardrobeView } from "@/components/WardrobeView";
import { $createClothingItem, $deleteClothingItem, $markItemWorn } from "@/lib/wardrobe/functions";

function WardrobeContent({ initialItems }: { initialItems?: ClothingItemWithDetails[] }) {
  const queryClient = useQueryClient();

  const { data: clientItems = initialItems ?? [], isLoading } = useQuery({
    queryKey: ["clothing-items"],
    queryFn: async () => {
      return $getClothingItems({ data: {} });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (item: Omit<ClothingItemWithDetails, "id" | "createdAt" | "timesWorn">) => {
      return $createClothingItem({
        data: {
          name: item.name,
          imageUrl: item.imageUrl,
          imagePublicId: item.imagePublicId,
          category: item.category,
          isPublic: item.isPublic,
          colors: item.colors.map((c) => c.color),
          seasons: item.seasons.map((s) => s.season),
          tagNames: item.tags.map((t) => t.tag.name),
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothing-items"] });
      toast.success("Item added");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return $deleteClothingItem({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothing-items"] });
      toast.success("Item deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markWornMutation = useMutation({
    mutationFn: async (id: string) => {
      return $markItemWorn({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clothing-items"] });
      toast.success("Marked as worn");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleAddItem = (item: Omit<ClothingItemWithDetails, "id" | "createdAt" | "timesWorn">) => {
    createMutation.mutate(item);
  };

  const handleDeleteItem = (item: ClothingItemWithDetails) => {
    deleteMutation.mutate(item.id);
  };

  const handleMarkWorn = (item: ClothingItemWithDetails) => {
    markWornMutation.mutate(item.id);
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl py-8">
      <WardrobeView
        items={clientItems}
        onAddItem={handleAddItem}
        onDeleteItem={handleDeleteItem}
        onMarkWorn={handleMarkWorn}
      />
    </div>
  );
}
