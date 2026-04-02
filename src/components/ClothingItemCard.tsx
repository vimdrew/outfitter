import { MoreHorizontal, Shirt, Trash2 } from "lucide-react";

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
  index?: number;
  onEdit?: (item: ClothingItemWithDetails) => void;
  onDelete?: (item: ClothingItemWithDetails) => void;
  onWear?: (item: ClothingItemWithDetails) => void;
}

export function ClothingItemCard({
  item,
  index = 0,
  onEdit,
  onDelete,
  onWear,
}: ClothingItemCardProps) {
  return (
    <div
      className="item-card animate-fade-in-up"
      style={{
        animationDelay: `${index * 50}ms`,
        opacity: 0,
      }}
    >
      <Card className="group relative overflow-hidden border border-foreground/10 bg-card transition-all hover:border-foreground/30">
        <div className="aspect-square overflow-hidden bg-muted/50">
          <img
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={item.imageUrl}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="icon"
              variant="secondary"
              className="h-7 w-7 border border-foreground/20 bg-background/80"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-sm border-foreground/20">
            {onWear && (
              <DropdownMenuItem onClick={() => onWear(item)}>
                <Shirt className="mr-2 h-3.5 w-3.5" />
                Mark as Worn
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(item)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <CardHeader className="p-3 pb-1">
          <h3 className="truncate text-sm font-medium tracking-tight">{item.name}</h3>
        </CardHeader>

        <CardContent className="p-3 pt-0">
          <Badge className="mb-2 text-[10px] tracking-widest uppercase" variant="secondary">
            {CATEGORY_LABELS[item.category]}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {item.colors.map((c) => (
              <Badge
                key={c.color}
                className="border-foreground/20 text-[9px] tracking-wider uppercase"
                variant="outline"
              >
                {c.color}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0 text-[10px] tracking-wider text-muted-foreground uppercase">
          {item.timesWorn} worn
        </CardFooter>
      </Card>
    </div>
  );
}
