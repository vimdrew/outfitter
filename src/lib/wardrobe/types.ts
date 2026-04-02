import type { categoryEnum, colorEnum, seasonEnum } from "@/lib/db/schema/wardrobe.schema";

export type Category = (typeof categoryEnum.enumValues)[number];
export type Color = (typeof colorEnum.enumValues)[number];
export type Season = (typeof seasonEnum.enumValues)[number];

export const CATEGORIES: Category[] = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
];

export const CATEGORY_LABELS: Record<Category, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  dresses: "Dresses",
  outerwear: "Outerwear",
  shoes: "Shoes",
  accessories: "Accessories",
};

export const SEASONS: Season[] = ["spring", "summer", "fall", "winter", "all-season"];

export const SEASON_LABELS: Record<Season, string> = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
  winter: "Winter",
  "all-season": "All Season",
};

export interface ClothingItemWithDetails {
  id: string;
  name: string;
  imageUrl: string;
  imagePublicId: string | null;
  category: Category;
  isPublic: boolean;
  timesWorn: number;
  createdAt: Date;
  colors: { color: Color }[];
  seasons: { season: Season }[];
  tags: { tag: { id: string; name: string } }[];
}

export interface WardrobeFilters {
  search: string;
  categories: Category[];
  colors: Color[];
  seasons: Season[];
  tags: string[];
}
