import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uuid,
  index,
} from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const categoryEnum = pgEnum("category", [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "accessories",
]);

export const seasonEnum = pgEnum("season", ["spring", "summer", "fall", "winter", "all-season"]);

export const colorEnum = pgEnum("color", [
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
]);

export const clothingItem = pgTable("clothing_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id"),
  category: categoryEnum("category").notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  timesWorn: integer("times_worn").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const clothingColor = pgTable(
  "clothing_color",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clothingItemId: uuid("clothing_item_id")
      .notNull()
      .references(() => clothingItem.id, { onDelete: "cascade" }),
    color: colorEnum("color").notNull(),
  },
  (table) => [index("clothing_color_item_idx").on(table.clothingItemId)],
);

export const clothingSeason = pgTable(
  "clothing_season",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clothingItemId: uuid("clothing_item_id")
      .notNull()
      .references(() => clothingItem.id, { onDelete: "cascade" }),
    season: seasonEnum("season").notNull(),
  },
  (table) => [index("clothing_season_item_idx").on(table.clothingItemId)],
);

export const tag = pgTable(
  "tag",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
  },
  (table) => [
    index("tag_user_idx").on(table.userId),
    { name: "tag_user_name_unique", columns: [table.userId, table.name] },
  ],
);

export const clothingTag = pgTable(
  "clothing_tag",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clothingItemId: uuid("clothing_item_id")
      .notNull()
      .references(() => clothingItem.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("clothing_tag_item_idx").on(table.clothingItemId),
    index("clothing_tag_tag_idx").on(table.tagId),
    { name: "clothing_tag_unique", columns: [table.clothingItemId, table.tagId] },
  ],
);

export const outfit = pgTable(
  "outfit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    isPublic: boolean("is_public").default(true).notNull(),
    timesWorn: integer("times_worn").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("outfit_user_idx").on(table.userId)],
);

export const outfitItem = pgTable(
  "outfit_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    outfitId: uuid("outfit_id")
      .notNull()
      .references(() => outfit.id, { onDelete: "cascade" }),
    clothingItemId: uuid("clothing_item_id")
      .notNull()
      .references(() => clothingItem.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("outfit_item_outfit_idx").on(table.outfitId),
    index("outfit_item_clothing_idx").on(table.clothingItemId),
    { name: "outfit_item_unique", columns: [table.outfitId, table.clothingItemId] },
  ],
);

export const wearLog = pgTable(
  "wear_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clothingItemId: uuid("clothing_item_id")
      .notNull()
      .references(() => clothingItem.id, { onDelete: "cascade" }),
    outfitId: uuid("outfit_id").references(() => outfit.id, { onDelete: "set null" }),
    wornAt: timestamp("worn_at").defaultNow().notNull(),
    note: text("note"),
  },
  (table) => [index("wear_log_item_idx").on(table.clothingItemId)],
);

export const clothingItemRelations = relations(clothingItem, ({ one, many }) => ({
  user: one(user, {
    fields: [clothingItem.userId],
    references: [user.id],
  }),
  colors: many(clothingColor),
  seasons: many(clothingSeason),
  tags: many(clothingTag),
  outfitItems: many(outfitItem),
  wearLogs: many(wearLog),
}));

export const clothingColorRelations = relations(clothingColor, ({ one }) => ({
  item: one(clothingItem, {
    fields: [clothingColor.clothingItemId],
    references: [clothingItem.id],
  }),
}));

export const clothingSeasonRelations = relations(clothingSeason, ({ one }) => ({
  item: one(clothingItem, {
    fields: [clothingSeason.clothingItemId],
    references: [clothingItem.id],
  }),
}));

export const tagRelations = relations(tag, ({ one, many }) => ({
  user: one(user, {
    fields: [tag.userId],
    references: [user.id],
  }),
  clothingTags: many(clothingTag),
}));

export const clothingTagRelations = relations(clothingTag, ({ one }) => ({
  item: one(clothingItem, {
    fields: [clothingTag.clothingItemId],
    references: [clothingItem.id],
  }),
  tag: one(tag, {
    fields: [clothingTag.tagId],
    references: [tag.id],
  }),
}));

export const outfitRelations = relations(outfit, ({ one, many }) => ({
  user: one(user, {
    fields: [outfit.userId],
    references: [user.id],
  }),
  items: many(outfitItem),
  wearLogs: many(wearLog),
}));

export const outfitItemRelations = relations(outfitItem, ({ one }) => ({
  outfit: one(outfit, {
    fields: [outfitItem.outfitId],
    references: [outfit.id],
  }),
  item: one(clothingItem, {
    fields: [outfitItem.clothingItemId],
    references: [clothingItem.id],
  }),
}));

export const wearLogRelations = relations(wearLog, ({ one }) => ({
  item: one(clothingItem, {
    fields: [wearLog.clothingItemId],
    references: [clothingItem.id],
  }),
  outfit: one(outfit, {
    fields: [wearLog.outfitId],
    references: [outfit.id],
  }),
}));
