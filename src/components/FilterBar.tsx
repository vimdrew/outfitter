import { Search, SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import type { Category, Color, Season, WardrobeFilters } from "@/lib/wardrobe/types";
import { CATEGORIES, CATEGORY_LABELS, SEASONS, SEASON_LABELS } from "@/lib/wardrobe/types";

const COLORS: Color[] = [
  "black",
  "white",
  "gray",
  "navy",
  "blue",
  "light-blue",
  "red",
  "pink",
  "orange",
  "yellow",
  "green",
  "olive",
  "brown",
  "tan",
  "beige",
  "purple",
  "burgundy",
  "cream",
  "multi",
  "other",
];

interface FilterBarProps {
  filters: WardrobeFilters;
  onFiltersChange: (filters: WardrobeFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.colors.length > 0 ||
    filters.seasons.length > 0 ||
    filters.tags.length > 0;

  const activeFilterCount =
    filters.categories.length +
    filters.colors.length +
    filters.seasons.length +
    filters.tags.length;

  const toggleCategory = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const toggleColor = (color: Color) => {
    const newColors = filters.colors.includes(color)
      ? filters.colors.filter((c) => c !== color)
      : [...filters.colors, color];
    onFiltersChange({ ...filters, colors: newColors });
  };

  const toggleSeason = (season: Season) => {
    const newSeasons = filters.seasons.includes(season)
      ? filters.seasons.filter((s) => s !== season)
      : [...filters.seasons, season];
    onFiltersChange({ ...filters, seasons: newSeasons });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      categories: [],
      colors: [],
      seasons: [],
      tags: [],
    });
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
      </div>

      <Popover>
        <PopoverTrigger className="gap-2">
          <Button variant="outline">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-1 h-5 w-5 justify-center p-0 text-xs" variant="secondary">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80">
          <div className="grid gap-6">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <label className="flex items-center gap-2" key={category}>
                    <Checkbox
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-sm">{CATEGORY_LABELS[category]}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Colors</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {COLORS.map((color) => (
                  <label className="flex items-center gap-2" key={color}>
                    <Checkbox
                      checked={filters.colors.includes(color)}
                      onCheckedChange={() => toggleColor(color)}
                    />
                    <span className="text-sm capitalize">{color.replace("-", " ")}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Seasons</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SEASONS.map((season) => (
                  <label className="flex items-center gap-2" key={season}>
                    <Checkbox
                      checked={filters.seasons.includes(season)}
                      onCheckedChange={() => toggleSeason(season)}
                    />
                    <span className="text-sm">{SEASON_LABELS[season]}</span>
                  </label>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <>
                <Separator />
                <Button className="w-full" size="sm" variant="ghost" onClick={clearFilters}>
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button className="gap-2" size="icon" variant="ghost" onClick={clearFilters}>
          <X className="h-4 w-4" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  );
}
