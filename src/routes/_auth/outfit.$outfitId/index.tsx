import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Shirt } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { $markOutfitWorn } from "@/lib/wardrobe/functions";
import type { Category } from "@/lib/wardrobe/types";

export const Route = createFileRoute("/_auth/outfit/$outfitId/")({
  component: OutfitDetailPage,
});

function OutfitDetailPage() {
  const queryClient = useQueryClient();
  const loaderData = Route.useLoaderData() as
    | {
        outfit: { id: string; name: string; description: string | null; timesWorn: number };
        items: Array<{
          id: string;
          name: string;
          imageUrl: string;
          category: Category;
          timesWorn: number;
        }>;
      }
    | undefined;

  if (!loaderData) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  const { outfit, items } = loaderData;

  const markWornMutation = useMutation({
    mutationFn: async () => {
      return $markOutfitWorn({ data: { id: outfit.id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      toast.success("Marked as worn!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4">
          <Link to="/outfits" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Outfits
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{outfit.name}</h1>
            {outfit.description && (
              <p className="mt-1 text-muted-foreground">{outfit.description}</p>
            )}
            <p className="mt-2 text-sm text-muted-foreground">
              {items.length} items · Worn {outfit.timesWorn} times
            </p>
          </div>
          <Button onClick={() => markWornMutation.mutate()}>
            <Shirt className="mr-2 h-4 w-4" />
            Mark as Worn
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-square">
              <img alt={item.name} className="h-full w-full object-cover" src={item.imageUrl} />
            </div>
            <CardContent className="p-3">
              <p className="truncate font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">Worn {item.timesWorn} times</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed py-12 text-center">
          <p className="text-muted-foreground">No items in this outfit</p>
        </div>
      )}
    </div>
  );
}
