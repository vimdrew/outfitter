import { Plus, Shirt } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { ClothingItemWithDetails, WardrobeFilters } from "@/lib/wardrobe/types";

import { ClothingItemCard } from "./ClothingItemCard";
import { FilterBar } from "./FilterBar";
import { ItemUploadDialog } from "./ItemUploadDialog";

interface WardrobeViewProps {
  items: ClothingItemWithDetails[];
  onAddItem?: (item: Omit<ClothingItemWithDetails, "id" | "createdAt" | "timesWorn">) => void;
  onEditItem?: (item: ClothingItemWithDetails) => void;
  onDeleteItem?: (item: ClothingItemWithDetails) => void;
  onMarkWorn?: (item: ClothingItemWithDetails) => void;
}

export function WardrobeView({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onMarkWorn,
}: WardrobeViewProps) {
  const [filters, setFilters] = useState<WardrobeFilters>({
    search: "",
    categories: [],
    colors: [],
    seasons: [],
    tags: [],
  });

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ClothingItemWithDetails | null>(null);

  const filteredItems = items.filter((item) => {
    if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    if (filters.categories.length > 0 && !filters.categories.includes(item.category)) {
      return false;
    }

    if (filters.colors.length > 0 && !item.colors.some((c) => filters.colors.includes(c.color))) {
      return false;
    }

    if (
      filters.seasons.length > 0 &&
      !item.seasons.some((s) => filters.seasons.includes(s.season))
    ) {
      return false;
    }

    return true;
  });

  const handleAddSuccess = (item: ClothingItemWithDetails) => {
    onAddItem?.({
      name: item.name,
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId,
      category: item.category,
      isPublic: item.isPublic,
      colors: item.colors,
      seasons: item.seasons,
      tags: item.tags,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteItem) {
      onDeleteItem?.(deleteItem);
      setDeleteItem(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <h1 className="text-2xl font-bold tracking-tight">My Wardrobe</h1>
        <Button
          className="gap-2 border border-foreground/20 bg-background hover:bg-foreground hover:text-background"
          onClick={() => setUploadDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="text-xs tracking-widest uppercase">Add Item</span>
        </Button>
      </div>

      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-foreground/10 py-24">
          {items.length === 0 ? (
            <>
              <Shirt className="mb-4 h-8 w-8 text-muted-foreground" />
              <h2 className="mb-1 text-lg font-medium tracking-tight">Your wardrobe is empty</h2>
              <p className="mb-6 text-xs tracking-widest text-muted-foreground uppercase">
                Start by adding some clothing items
              </p>
              <Button
                className="border border-foreground/20 bg-background hover:bg-foreground hover:text-background"
                onClick={() => setUploadDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="text-xs tracking-widest uppercase">Add Your First Item</span>
              </Button>
            </>
          ) : (
            <p className="text-xs tracking-widest text-muted-foreground uppercase">
              No items match your filters
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item, index) => (
            <ClothingItemCard
              key={item.id}
              item={item}
              index={index}
              onDelete={onDeleteItem ? setDeleteItem : undefined}
              onEdit={onEditItem}
              onWear={onMarkWorn}
            />
          ))}
        </div>
      )}

      <ItemUploadDialog
        onOpenChange={setUploadDialogOpen}
        onSuccess={handleAddSuccess}
        open={uploadDialogOpen}
      />

      <AlertDialog onOpenChange={(open) => !open && setDeleteItem(null)} open={!!deleteItem}>
        <AlertDialogContent className="animate-slide-in-up rounded-sm border-foreground/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xs tracking-widest uppercase">
              Delete Item
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-end">
            <AlertDialogCancel className="text-xs tracking-widest uppercase">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-foreground text-xs tracking-widest text-background uppercase hover:bg-foreground/90"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
