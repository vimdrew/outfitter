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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Wardrobe</h1>
        <Button className="gap-2" onClick={() => setUploadDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Item
        </Button>
      </div>

      <FilterBar filters={filters} onFiltersChange={setFilters} />

      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          {items.length === 0 ? (
            <>
              <Shirt className="mb-4 h-12 w-12 text-muted-foreground" />
              <h2 className="mb-2 text-lg font-medium">Your wardrobe is empty</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Start by adding some clothing items
              </p>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">No items match your filters</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredItems.map((item) => (
            <ClothingItemCard
              key={item.id}
              item={item}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="text-destructive-foreground bg-destructive hover:bg-destructive/90"
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
