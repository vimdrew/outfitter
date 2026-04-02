# Outfitter - Context & Progress

## Overview

Outfitter is a personal wardrobe management app for uploading clothing photos, organizing items, building outfits, and tracking wear history.

**Stack:** TypeScript + React (TanStack Start), Drizzle ORM, PostgreSQL, shadcn/ui, Tailwind CSS v4, Better Auth, Cloudinary

---

## Completed

### Phase 1: Database Schema

**File:** `src/lib/db/schema/wardrobe.schema.ts`

| Table             | Purpose                                                           |
| ----------------- | ----------------------------------------------------------------- |
| `clothing_item`   | Core items with name, image URL, category, visibility, wear count |
| `clothing_color`  | Junction for multi-color items                                    |
| `clothing_season` | Junction for seasonal tagging                                     |
| `tag`             | User-defined custom tags (unique per user)                        |
| `clothing_tag`    | Junction for custom tags                                          |
| `outfit`          | Saved outfits with name, description, visibility, wear count      |
| `outfit_item`     | Junction linking outfits to items                                 |
| `wear_log`        | Individual wear events with optional outfit reference             |

**Enums:** `category` (6 values), `season` (5 values), `color` (20 values)

**Migration:** `drizzle/0000_curious_rogue.sql` - applied successfully

---

### Phase 2: Cloudinary Integration

**Files:**

- `src/lib/cloudinary/client.ts` - Cloudinary config with `getImageUrl`, `getThumbnailUrl`, `deleteImage`
- `src/lib/cloudinary/upload.ts` - `$uploadImage` server function (accepts base64 dataUrl + fileName)

**Env vars added to `src/env/server.ts`:**

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_PRESET`

---

### Phase 3: UI Components

**Files:**

- `src/lib/wardrobe/types.ts` - Shared types (`ClothingItemWithDetails`, `WardrobeFilters`, constants)
- `src/components/ClothingItemCard.tsx` - Item card with image, badges, dropdown menu
- `src/components/ItemUploadDialog.tsx` - Upload form with image preview, category/colors/seasons
- `src/components/FilterBar.tsx` - Search + popover filters
- `src/components/WardrobeView.tsx` - Main grid view with filtering and empty states

**Added shadcn components:** dialog, card, badge, select, checkbox, separator, dropdown-menu, popover, alert-dialog

---

## Remaining Work

### Phase 4: Server Functions (CRUD)

**Need to create:**

- `$createClothingItem` - Insert item + colors/seasons/tags
- `$getClothingItems` - Fetch user's items with relations
- `$updateClothingItem` - Update item details
- `$deleteClothingItem` - Delete item + Cloudinary image
- `$markItemWorn` - Increment timesWorn + add wearLog entry
- `$createOutfit` - Insert outfit + outfit_items
- `$getOutfits` - Fetch user's outfits with items
- `$deleteOutfit` - Delete outfit
- `$markOutfitWorn` - Increment outfit wear count + all items

**Need to add env vars:** None (Cloudinary already configured)

---

### Phase 5: Routes & Pages

**Routes to create under `src/routes/_auth/`:**
| Route | Purpose |
|-------|---------|
| `/wardrobe` | Main wardrobe view (replace placeholder) |
| `/outfits` | List of saved outfits |
| `/outfits/new` | Outfit builder |
| `/outfit/$outfitId` | Outfit detail (public if `isPublic`) |

**Also need:**

- `/` redirect to `/wardrobe`
- Public outfit view route (no auth required)

---

### Phase 6: Integration

**Wardrobe page needs:**

- TanStack Query wrappers for server functions
- Loader that fetches user's clothing items
- Wire up `onAddItem`, `onDeleteItem`, `onMarkWorn` to mutations

**Outfit builder needs:**

- Item selection UI (grid with checkboxes)
- Save outfit server function
- List view with edit/delete

---

## Architecture Notes

- All server functions use `$` prefix and are imported statically
- Auth protected via `_auth` route group with `beforeLoad`
- Server functions requiring auth must use `authMiddleware` from `@/lib/auth/middleware`
- Clothing items/outfits default to `isPublic: true` (public by default)
- Image deletion from Cloudinary when item is deleted

---

## Testing

No testing framework set up yet. Use `pnpm lint` for validation.

```bash
pnpm lint          # Type-aware linting
pnpm lint:fix      # Auto-fix issues
pnpm db studio     # Open Drizzle Studio
```
