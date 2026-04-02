import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { $createOutfit, $getClothingItems } from "@/lib/wardrobe/functions";
import { CATEGORIES, CATEGORY_LABELS } from "@/lib/wardrobe/types";

export const Route = createFileRoute("/_auth/outfits/new/")({
  component: NewOutfitPage,
});

function NewOutfitPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data: allItems = [], isLoading } = useQuery({
    queryKey: ["clothing-items"],
    queryFn: async () => {
      return $getClothingItems({ data: {} });
    },
  });

  const filteredItems =
    categoryFilter === "all"
      ? allItems
      : allItems.filter((item) => item.category === categoryFilter);

  const createMutation = useMutation({
    mutationFn: async () => {
      return $createOutfit({
        data: {
          name,
          description: description || undefined,
          itemIds: selectedItems,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outfits"] });
      toast.success("Outfit created");
      router.navigate({ to: "/outfits" });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleToggleItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (selectedItems.length === 0) {
      toast.error("Please select at least one item");
      return;
    }
    createMutation.mutate();
  };

  if (isLoading) {
    return <div className="p-8 text-center text-xs tracking-widest uppercase">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">Create Outfit</h1>
        <Button variant="ghost" className="text-xs tracking-widest uppercase">
          <Link to="/outfits">Cancel</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-5 rounded-sm border border-foreground/10 bg-card p-5">
              <div className="grid gap-1.5">
                <Label className="text-[10px] tracking-widest uppercase" htmlFor="name">
                  Outfit Name
                </Label>
                <Input
                  id="name"
                  className="rounded-sm border-foreground/20 bg-background"
                  placeholder="e.g., Casual Friday"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-[10px] tracking-widest uppercase" htmlFor="description">
                  Description (optional)
                </Label>
                <Input
                  id="description"
                  className="rounded-sm border-foreground/20 bg-background"
                  placeholder="e.g., Smart casual for work"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label className="text-[10px] tracking-widest uppercase">Filter by Category</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(value) => setCategoryFilter(value || "all")}
                >
                  <SelectTrigger className="rounded-sm border-foreground/20 bg-background">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-xs">
                      All Categories
                    </SelectItem>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-xs">
                        {CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <p className="mb-3 text-[10px] tracking-widest text-muted-foreground uppercase">
                  {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
                </p>
                <Button
                  className="w-full rounded-sm border border-foreground/20 bg-foreground text-background hover:bg-foreground/90"
                  disabled={createMutation.isPending}
                  type="submit"
                >
                  <span className="text-xs tracking-widest uppercase">
                    {createMutation.isPending ? "Saving..." : "Save Outfit"}
                  </span>
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`group relative cursor-pointer overflow-hidden border transition-all ${
                      isSelected
                        ? "border-foreground bg-foreground/5"
                        : "border-transparent hover:border-foreground/20"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      className="absolute top-2 left-2 z-10 h-4 w-4 rounded-sm border-foreground/30"
                      id={`item-${item.id}`}
                      onCheckedChange={() => handleToggleItem(item.id)}
                    />
                    <label htmlFor={`item-${item.id}`} className="block cursor-pointer">
                      <div className="aspect-square">
                        <img
                          alt={item.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          src={item.imageUrl}
                        />
                      </div>
                      <div className="bg-card p-2">
                        <p className="truncate text-xs font-medium">{item.name}</p>
                        <p className="text-[10px] tracking-wider text-muted-foreground uppercase">
                          {CATEGORY_LABELS[item.category]}
                        </p>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center border border-foreground/10 py-12">
                <p className="mb-4 text-xs tracking-widest text-muted-foreground uppercase">
                  No items in your wardrobe
                </p>
                <Button className="border border-foreground/20 bg-background hover:bg-foreground hover:text-background">
                  <Link to="/wardrobe">Add Items</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
