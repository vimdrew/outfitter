import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CORE_COLORS, COLOR_HEX } from "@/lib/colors";
import { $getUserColors } from "@/lib/wardrobe/functions";
import type { Category, Color, Season, WardrobeFilters } from "@/lib/wardrobe/types";
import { CATEGORIES, CATEGORY_LABELS, SEASONS, SEASON_LABELS } from "@/lib/wardrobe/types";

interface FilterBarProps {
  filters: WardrobeFilters;
  onFiltersChange: (filters: WardrobeFilters) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const { data: userColors = [] } = useQuery({
    queryKey: ["user-colors"],
    queryFn: async () => {
      return $getUserColors();
    },
  });

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

  const displayColors = userColors.length > 0 ? userColors : CORE_COLORS;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="relative flex-1">
        <Input
          className="rounded-sm border-foreground/20 bg-background pl-4 text-sm placeholder:text-muted-foreground/70"
          placeholder="Search items..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
        />
      </div>

      <Popover>
        <PopoverTrigger>
          <Button
            variant="outline"
            className="gap-2 rounded-sm border-foreground/20 bg-background text-xs tracking-widest uppercase hover:bg-foreground hover:text-background"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <Badge
                className="ml-1 h-5 min-w-5 justify-center rounded-sm bg-foreground text-[10px] text-background"
                variant="secondary"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 rounded-sm border-foreground/20 p-4">
          <div className="grid gap-5">
            <div>
              <Label className="text-[10px] tracking-widest uppercase">Category</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {CATEGORIES.map((category) => (
                  <label className="flex cursor-pointer items-center gap-1.5" key={category}>
                    <Checkbox
                      className="h-3.5 w-3.5 rounded-sm border-foreground/30"
                      checked={filters.categories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <span className="text-xs">{CATEGORY_LABELS[category]}</span>
                  </label>
                ))}
              </div>
            </div>

            <Separator className="bg-foreground/10" />

            <div>
              <Label className="text-[10px] tracking-widest uppercase">
                Colors {userColors.length > 0 ? "(your wardrobe)" : "(all)"}
              </Label>
              {userColors.length === 0 && (
                <p className="mb-2 text-[10px] text-muted-foreground">
                  Add items to filter by color
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {displayColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`flex items-center gap-1 rounded-sm border px-2 py-1 text-xs transition-all ${
                      filters.colors.includes(color)
                        ? "border-foreground bg-foreground text-background"
                        : "border-foreground/20 hover:border-foreground/50"
                    } `}
                  >
                    <span
                      className="h-3 w-3 rounded-full border border-foreground/30"
                      style={{
                        backgroundColor:
                          color === "multi" ? "transparent" : COLOR_HEX[color as Color],
                        background:
                          color === "multi"
                            ? "conic-gradient(red, yellow, green, blue, red)"
                            : undefined,
                      }}
                    />
                    <span className="capitalize">{color}</span>
                  </button>
                ))}
              </div>
            </div>

            <Separator className="bg-foreground/10" />

            <div>
              <Label className="text-[10px] tracking-widest uppercase">Seasons</Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {SEASONS.map((season) => (
                  <label className="flex cursor-pointer items-center gap-1.5" key={season}>
                    <Checkbox
                      className="h-3.5 w-3.5 rounded-sm border-foreground/30"
                      checked={filters.seasons.includes(season)}
                      onCheckedChange={() => toggleSeason(season)}
                    />
                    <span className="text-xs">{SEASON_LABELS[season]}</span>
                  </label>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <>
                <Separator className="bg-foreground/10" />
                <Button
                  className="w-full rounded-sm border border-foreground/20 bg-background text-xs tracking-widest uppercase hover:bg-foreground hover:text-background"
                  size="sm"
                  variant="ghost"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              </>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button
          className="gap-2 rounded-sm border border-foreground/20 bg-background text-xs tracking-widest uppercase hover:bg-foreground hover:text-background"
          size="icon"
          variant="ghost"
          onClick={clearFilters}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Clear filters</span>
        </Button>
      )}
    </div>
  );
}
