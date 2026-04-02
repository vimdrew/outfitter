import { createServerFn } from "@tanstack/react-start";
import { eq, and, inArray } from "drizzle-orm";

import { _getUser } from "@/lib/auth/functions";
import { deleteImage } from "@/lib/cloudinary/client";
import { db } from "@/lib/db";
import {
  clothingItem,
  clothingColor,
  clothingSeason,
  clothingTag,
  tag,
  outfit,
  outfitItem,
  wearLog,
} from "@/lib/db/schema/wardrobe.schema";
import type { Category, Color, Season } from "@/lib/wardrobe/types";

export interface OutfitWithDetails {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  timesWorn: number;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    imageUrl: string;
    category: Category;
  }[];
}

export interface ClothingItemWithRelations {
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

export interface CreateClothingItemInput {
  name: string;
  imageUrl: string;
  imagePublicId: string | null;
  category: Category;
  isPublic?: boolean;
  colors: Color[];
  seasons: Season[];
  tagNames: string[];
}

export interface GetClothingItemsFilters {
  search?: string;
  categories?: Category[];
  colors?: Color[];
  seasons?: Season[];
  tagNames?: string[];
}

const $createClothingItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as CreateClothingItemInput;
    if (typeof input.name !== "string" || !input.name.trim()) {
      throw new Error("Name is required");
    }
    if (typeof input.imageUrl !== "string" || !input.imageUrl) {
      throw new Error("Image URL is required");
    }
    if (typeof input.category !== "string") {
      throw new Error("Category is required");
    }
    if (!Array.isArray(input.colors)) {
      throw new Error("Colors must be an array");
    }
    if (!Array.isArray(input.seasons)) {
      throw new Error("Seasons must be an array");
    }
    if (!Array.isArray(input.tagNames)) {
      throw new Error("Tag names must be an array");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const [newItem] = await db
      .insert(clothingItem)
      .values({
        userId,
        name: data.name,
        imageUrl: data.imageUrl,
        imagePublicId: data.imagePublicId,
        category: data.category,
        isPublic: data.isPublic ?? true,
      })
      .returning();

    if (data.colors.length > 0) {
      await db.insert(clothingColor).values(
        data.colors.map((color) => ({
          clothingItemId: newItem.id,
          color,
        })),
      );
    }

    if (data.seasons.length > 0) {
      await db.insert(clothingSeason).values(
        data.seasons.map((season) => ({
          clothingItemId: newItem.id,
          season,
        })),
      );
    }

    if (data.tagNames.length > 0) {
      const existingTags = await db
        .select()
        .from(tag)
        .where(and(eq(tag.userId, userId), eq(tag.name, data.tagNames[0])));

      const tagNameToId = new Map<string, string>();
      for (const t of existingTags) {
        tagNameToId.set(t.name, t.id);
      }

      const newTagNames = data.tagNames.filter((name) => !tagNameToId.has(name));
      if (newTagNames.length > 0) {
        const newTags = await db
          .insert(tag)
          .values(
            newTagNames.map((name) => ({
              userId,
              name,
            })),
          )
          .returning();
        for (const t of newTags) {
          tagNameToId.set(t.name, t.id);
        }
      }

      await db.insert(clothingTag).values(
        data.tagNames.map((name) => ({
          clothingItemId: newItem.id,
          tagId: tagNameToId.get(name)!,
        })),
      );
    }

    return newItem;
  });

const $getClothingItems = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => {
    const input = data as GetClothingItemsFilters;
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const items = await db
      .select({
        id: clothingItem.id,
        name: clothingItem.name,
        imageUrl: clothingItem.imageUrl,
        imagePublicId: clothingItem.imagePublicId,
        category: clothingItem.category,
        isPublic: clothingItem.isPublic,
        timesWorn: clothingItem.timesWorn,
        createdAt: clothingItem.createdAt,
      })
      .from(clothingItem)
      .where(eq(clothingItem.userId, userId))
      .orderBy(clothingItem.createdAt);

    if (items.length === 0) {
      return [];
    }

    const itemIds = items.map((i) => i.id);

    const colors = await db
      .select()
      .from(clothingColor)
      .where(inArray(clothingColor.clothingItemId, itemIds));

    const seasons = await db
      .select()
      .from(clothingSeason)
      .where(inArray(clothingSeason.clothingItemId, itemIds));

    const tags = await db
      .select({
        tagId: clothingTag.id,
        clothingItemId: clothingTag.clothingItemId,
        tagName: tag.name,
        tagIdCol: tag.id,
      })
      .from(clothingTag)
      .leftJoin(tag, eq(clothingTag.tagId, tag.id))
      .where(inArray(clothingTag.clothingItemId, itemIds));

    const itemMap = new Map<
      string,
      {
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
    >();

    for (const item of items) {
      itemMap.set(item.id, {
        ...item,
        colors: [],
        seasons: [],
        tags: [],
      });
    }

    for (const color of colors) {
      const item = itemMap.get(color.clothingItemId);
      if (item) {
        item.colors.push({ color: color.color as Color });
      }
    }

    for (const season of seasons) {
      const item = itemMap.get(season.clothingItemId);
      if (item) {
        item.seasons.push({ season: season.season as Season });
      }
    }

    for (const t of tags) {
      const item = itemMap.get(t.clothingItemId);
      if (item && t.tagName && t.tagIdCol) {
        item.tags.push({ tag: { id: t.tagIdCol, name: t.tagName } });
      }
    }

    let result = Array.from(itemMap.values());

    if (data.search) {
      const searchLower = data.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.tags.some((t) => t.tag.name.toLowerCase().includes(searchLower)),
      );
    }

    if (data.categories?.length) {
      result = result.filter((item) => data.categories!.includes(item.category));
    }

    if (data.colors?.length) {
      result = result.filter((item) => item.colors.some((c) => data.colors!.includes(c.color)));
    }

    if (data.seasons?.length) {
      result = result.filter((item) => item.seasons.some((s) => data.seasons!.includes(s.season)));
    }

    if (data.tagNames?.length) {
      result = result.filter((item) => item.tags.some((t) => data.tagNames!.includes(t.tag.name)));
    }

    return result;
  });

interface UpdateClothingItemInput {
  id: string;
  name?: string;
  category?: Category;
  isPublic?: boolean;
  colors?: Color[];
  seasons?: Season[];
  tagNames?: string[];
}

const $updateClothingItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as UpdateClothingItemInput;
    if (typeof input.id !== "string" || !input.id) {
      throw new Error("ID is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const existing = await db
      .select()
      .from(clothingItem)
      .where(eq(clothingItem.id, data.id))
      .limit(1);

    if (!existing.length || existing[0].userId !== userId) {
      throw new Error("Item not found");
    }

    const updateData: Partial<typeof clothingItem.$inferInsert> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;

    if (Object.keys(updateData).length > 0) {
      await db.update(clothingItem).set(updateData).where(eq(clothingItem.id, data.id));
    }

    if (data.colors !== undefined) {
      await db.delete(clothingColor).where(eq(clothingColor.clothingItemId, data.id));
      if (data.colors.length > 0) {
        await db.insert(clothingColor).values(
          data.colors.map((color) => ({
            clothingItemId: data.id,
            color,
          })),
        );
      }
    }

    if (data.seasons !== undefined) {
      await db.delete(clothingSeason).where(eq(clothingSeason.clothingItemId, data.id));
      if (data.seasons.length > 0) {
        await db.insert(clothingSeason).values(
          data.seasons.map((season) => ({
            clothingItemId: data.id,
            season,
          })),
        );
      }
    }

    if (data.tagNames !== undefined) {
      await db.delete(clothingTag).where(eq(clothingTag.clothingItemId, data.id));

      if (data.tagNames.length > 0) {
        const existingTags = await db
          .select()
          .from(tag)
          .where(and(eq(tag.userId, userId), eq(tag.name, data.tagNames[0])));

        const tagNameToId = new Map<string, string>();
        for (const t of existingTags) {
          tagNameToId.set(t.name, t.id);
        }

        const newTagNames = data.tagNames.filter((name) => !tagNameToId.has(name));
        if (newTagNames.length > 0) {
          const newTags = await db
            .insert(tag)
            .values(
              newTagNames.map((name) => ({
                userId,
                name,
              })),
            )
            .returning();
          for (const t of newTags) {
            tagNameToId.set(t.name, t.id);
          }
        }

        await db.insert(clothingTag).values(
          data.tagNames.map((name) => ({
            clothingItemId: data.id,
            tagId: tagNameToId.get(name)!,
          })),
        );
      }
    }

    return { success: true };
  });

const $deleteClothingItem = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as { id: string };
    if (typeof input.id !== "string" || !input.id) {
      throw new Error("ID is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const existing = await db
      .select()
      .from(clothingItem)
      .where(eq(clothingItem.id, data.id))
      .limit(1);

    if (!existing.length || existing[0].userId !== userId) {
      throw new Error("Item not found");
    }

    if (existing[0].imagePublicId) {
      await deleteImage(existing[0].imagePublicId);
    }

    await db.delete(clothingItem).where(eq(clothingItem.id, data.id));

    return { success: true };
  });

interface MarkItemWornInput {
  id: string;
  note?: string;
}

const $markItemWorn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as MarkItemWornInput;
    if (typeof input.id !== "string" || !input.id) {
      throw new Error("ID is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const existing = await db
      .select()
      .from(clothingItem)
      .where(eq(clothingItem.id, data.id))
      .limit(1);

    if (!existing.length || existing[0].userId !== userId) {
      throw new Error("Item not found");
    }

    const newTimesWorn = existing[0].timesWorn + 1;

    await db
      .update(clothingItem)
      .set({ timesWorn: newTimesWorn })
      .where(eq(clothingItem.id, data.id));

    await db.insert(wearLog).values({
      clothingItemId: data.id,
      note: data.note,
    });

    return { success: true, timesWorn: newTimesWorn };
  });

interface CreateOutfitInput {
  name: string;
  description?: string;
  isPublic?: boolean;
  itemIds: string[];
}

const $createOutfit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as CreateOutfitInput;
    if (typeof input.name !== "string" || !input.name.trim()) {
      throw new Error("Name is required");
    }
    if (!Array.isArray(input.itemIds) || input.itemIds.length === 0) {
      throw new Error("At least one item is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const userItems = await db
      .select({ id: clothingItem.id })
      .from(clothingItem)
      .where(eq(clothingItem.userId, userId));

    const userItemIds = new Set(userItems.map((i) => i.id));
    for (const itemId of data.itemIds) {
      if (!userItemIds.has(itemId)) {
        throw new Error("Invalid item ID");
      }
    }

    const [newOutfit] = await db
      .insert(outfit)
      .values({
        userId,
        name: data.name,
        description: data.description,
        isPublic: data.isPublic ?? true,
      })
      .returning();

    await db.insert(outfitItem).values(
      data.itemIds.map((itemId) => ({
        outfitId: newOutfit.id,
        clothingItemId: itemId,
      })),
    );

    return newOutfit;
  });

const $getOutfits = createServerFn({ method: "GET" }).handler(async () => {
  const user = await _getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const userId = user.id;

  const outfitsData = await db
    .select()
    .from(outfit)
    .where(eq(outfit.userId, userId))
    .orderBy(outfit.createdAt);

  if (outfitsData.length === 0) {
    return [];
  }

  const outfitIds = outfitsData.map((o) => o.id);

  const items = await db
    .select({
      outfitItemId: outfitItem.id,
      outfitId: outfitItem.outfitId,
      itemId: clothingItem.id,
      itemName: clothingItem.name,
      itemImageUrl: clothingItem.imageUrl,
      itemCategory: clothingItem.category,
    })
    .from(outfitItem)
    .leftJoin(clothingItem, eq(outfitItem.clothingItemId, clothingItem.id))
    .where(inArray(outfitItem.outfitId, outfitIds));

  const outfitMap = new Map<string, OutfitWithDetails>();
  for (const o of outfitsData) {
    outfitMap.set(o.id, {
      id: o.id,
      name: o.name,
      description: o.description,
      isPublic: o.isPublic,
      timesWorn: o.timesWorn,
      createdAt: o.createdAt,
      items: [],
    });
  }

  for (const item of items) {
    const outfit = outfitMap.get(item.outfitId);
    if (outfit && item.itemId && item.itemName && item.itemImageUrl && item.itemCategory) {
      outfit.items.push({
        id: item.itemId,
        name: item.itemName,
        imageUrl: item.itemImageUrl,
        category: item.itemCategory,
      });
    }
  }

  return Array.from(outfitMap.values());
});

const $deleteOutfit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as { id: string };
    if (typeof input.id !== "string" || !input.id) {
      throw new Error("ID is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const existing = await db.select().from(outfit).where(eq(outfit.id, data.id)).limit(1);

    if (!existing.length || existing[0].userId !== userId) {
      throw new Error("Outfit not found");
    }

    await db.delete(outfit).where(eq(outfit.id, data.id));

    return { success: true };
  });

interface MarkOutfitWornInput {
  id: string;
  note?: string;
}

const $markOutfitWorn = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => {
    const input = data as MarkOutfitWornInput;
    if (typeof input.id !== "string" || !input.id) {
      throw new Error("ID is required");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const user = await _getUser();
    if (!user) {
      throw new Error("Unauthorized");
    }
    const userId = user.id;

    const existing = await db.select().from(outfit).where(eq(outfit.id, data.id)).limit(1);

    if (!existing.length || existing[0].userId !== userId) {
      throw new Error("Outfit not found");
    }

    const newTimesWorn = existing[0].timesWorn + 1;

    await db.update(outfit).set({ timesWorn: newTimesWorn }).where(eq(outfit.id, data.id));

    const outfitItems = await db.select().from(outfitItem).where(eq(outfitItem.outfitId, data.id));

    for (const oi of outfitItems) {
      const item = await db
        .select()
        .from(clothingItem)
        .where(eq(clothingItem.id, oi.clothingItemId))
        .limit(1);

      if (item.length) {
        await db
          .update(clothingItem)
          .set({ timesWorn: item[0].timesWorn + 1 })
          .where(eq(clothingItem.id, oi.clothingItemId));
      }

      await db.insert(wearLog).values({
        clothingItemId: oi.clothingItemId,
        outfitId: data.id,
        note: data.note,
      });
    }

    return { success: true, timesWorn: newTimesWorn };
  });

export {
  $createClothingItem,
  $getClothingItems,
  $updateClothingItem,
  $deleteClothingItem,
  $markItemWorn,
  $createOutfit,
  $getOutfits,
  $deleteOutfit,
  $markOutfitWorn,
  $getUserColors,
};

const $getUserColors = createServerFn({ method: "GET" }).handler(async () => {
  const user = await _getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const items = await db
    .select({ color: clothingColor.color })
    .from(clothingColor)
    .leftJoin(clothingItem, eq(clothingColor.clothingItemId, clothingItem.id))
    .where(eq(clothingItem.userId, user.id));

  const uniqueColors = [...new Set(items.map((i) => i.color).filter(Boolean))];

  return uniqueColors as Color[];
});
