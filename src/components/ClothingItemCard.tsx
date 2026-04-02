import { MoreHorizontal, Shirt, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClothingItemWithDetails } from "@/lib/wardrobe/types";
import { CATEGORY_LABELS } from "@/lib/wardrobe/types";

interface ClothingItemCardProps {
  item: ClothingItemWithDetails;
  onEdit?: (item: ClothingItemWithDetails) => void;
  onDelete?: (item: ClothingItemWithDetails) => void;
  onWear?: (item: ClothingItemWithDetails) => void;
}

export function ClothingItemCard({ item, onEdit, onDelete, onWear }: ClothingItemCardProps) {
  return (
    <Card className="group relative overflow-hidden">
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          src={item.imageUrl}
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button size="icon" variant="secondary">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(item)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {onWear && (
            <DropdownMenuItem onClick={() => onWear(item)}>
              <Shirt className="mr-2 h-4 w-4" />
              Mark as Worn
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          {onDelete && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDelete(item)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="leading-tight font-medium">{item.name}</h3>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0">
        <Badge className="mb-2" variant="secondary">
          {CATEGORY_LABELS[item.category]}
        </Badge>
        <div className="flex flex-wrap gap-1">
          {item.colors.map((c) => (
            <Badge className="text-xs" key={c.color} variant="outline">
              {c.color}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
        Worn {item.timesWorn} time{item.timesWorn !== 1 ? "s" : ""}
      </CardFooter>
    </Card>
  );
}
