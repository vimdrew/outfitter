import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Plus, Shirt, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { $deleteOutfit, $getOutfits } from "@/lib/wardrobe/functions";

export const Route = createFileRoute("/_auth/outfits/")({
  component: OutfitsPage,
});

function OutfitsPage() {
  const queryClient = useQueryClient();

  const { data: outfits = [], isLoading } = useQuery({
    queryKey: ["outfits"],
    queryFn: async () => {
      return $getOutfits();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return $deleteOutfit({ data: { id } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      toast.success("Outfit deleted");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs tracking-widest uppercase">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">My Outfits</h1>
        <Button className="gap-2 border border-foreground/20 bg-background hover:bg-foreground hover:text-background">
          <Link to="/outfits/new" className="flex items-center">
            <Plus className="h-4 w-4" />
            <span className="text-xs tracking-widest uppercase">Create Outfit</span>
          </Link>
        </Button>
      </div>

      {outfits.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-foreground/10 py-24">
          <Shirt className="mb-4 h-8 w-8 text-muted-foreground" />
          <h2 className="mb-1 text-lg font-medium tracking-tight">No outfits yet</h2>
          <p className="mb-6 text-xs tracking-widest text-muted-foreground uppercase">
            Create your first outfit by combining wardrobe items
          </p>
          <Button className="border border-foreground/20 bg-background hover:bg-foreground hover:text-background">
            <Link to="/outfits/new">Create Your First Outfit</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {outfits.map((outfit, index) => (
            <Card
              key={outfit.id}
              className="animate-fade-in-up overflow-hidden border border-foreground/10 transition-all hover:border-foreground/30"
              style={{
                animationDelay: `${index * 50}ms`,
                opacity: 0,
              }}
            >
              <div className="flex aspect-[4/3] flex-wrap gap-0.5 overflow-hidden bg-muted/50 p-0.5">
                {outfit.items.slice(0, 4).map((item) => (
                  <div key={item.id} className="h-full w-full flex-1 overflow-hidden">
                    <img
                      alt={item.name}
                      className="h-full w-full object-cover"
                      src={item.imageUrl}
                    />
                  </div>
                ))}
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base tracking-tight">{outfit.name}</CardTitle>
                {outfit.description && (
                  <p className="line-clamp-2 text-xs text-muted-foreground">{outfit.description}</p>
                )}
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
                  {outfit.items.length} items · {outfit.timesWorn} worn
                </p>
              </CardContent>
              <CardFooter className="gap-2 p-4 pt-0">
                <Button className="flex-1 rounded-sm border border-foreground/20 bg-foreground text-background hover:bg-foreground/90">
                  <Link to="/outfit/$outfitId" params={{ outfitId: outfit.id }}>
                    View
                  </Link>
                </Button>
                <Button
                  className="h-9 w-9 rounded-sm border border-foreground/20"
                  size="icon"
                  variant="outline"
                  onClick={() => handleDelete(outfit.id)}
                >
                  <Trash2Icon className="h-3.5 w-3.5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
