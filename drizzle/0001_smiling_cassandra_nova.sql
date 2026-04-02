ALTER TABLE "clothing_color" ALTER COLUMN "color" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."color";--> statement-breakpoint
CREATE TYPE "public"."color" AS ENUM('black', 'white', 'gray', 'navy', 'blue', 'red', 'green', 'brown', 'beige', 'multi');--> statement-breakpoint
ALTER TABLE "clothing_color" ALTER COLUMN "color" SET DATA TYPE "public"."color" USING "color"::"public"."color";