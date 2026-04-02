CREATE TYPE "public"."category" AS ENUM('tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories');--> statement-breakpoint
CREATE TYPE "public"."color" AS ENUM('black', 'white', 'gray', 'navy', 'blue', 'light-blue', 'red', 'pink', 'orange', 'yellow', 'green', 'olive', 'brown', 'tan', 'beige', 'purple', 'burgundy', 'cream', 'multi', 'other');--> statement-breakpoint
CREATE TYPE "public"."season" AS ENUM('spring', 'summer', 'fall', 'winter', 'all-season');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clothing_color" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clothing_item_id" uuid NOT NULL,
	"color" "color" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clothing_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"image_url" text NOT NULL,
	"image_public_id" text,
	"category" "category" NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"times_worn" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clothing_season" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clothing_item_id" uuid NOT NULL,
	"season" "season" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clothing_tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clothing_item_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outfit" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_public" boolean DEFAULT true NOT NULL,
	"times_worn" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outfit_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"outfit_id" uuid NOT NULL,
	"clothing_item_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tag" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wear_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clothing_item_id" uuid NOT NULL,
	"outfit_id" uuid,
	"worn_at" timestamp DEFAULT now() NOT NULL,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clothing_color" ADD CONSTRAINT "clothing_color_clothing_item_id_clothing_item_id_fk" FOREIGN KEY ("clothing_item_id") REFERENCES "public"."clothing_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clothing_item" ADD CONSTRAINT "clothing_item_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clothing_season" ADD CONSTRAINT "clothing_season_clothing_item_id_clothing_item_id_fk" FOREIGN KEY ("clothing_item_id") REFERENCES "public"."clothing_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clothing_tag" ADD CONSTRAINT "clothing_tag_clothing_item_id_clothing_item_id_fk" FOREIGN KEY ("clothing_item_id") REFERENCES "public"."clothing_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clothing_tag" ADD CONSTRAINT "clothing_tag_tag_id_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit" ADD CONSTRAINT "outfit_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit_item" ADD CONSTRAINT "outfit_item_outfit_id_outfit_id_fk" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outfit_item" ADD CONSTRAINT "outfit_item_clothing_item_id_clothing_item_id_fk" FOREIGN KEY ("clothing_item_id") REFERENCES "public"."clothing_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tag" ADD CONSTRAINT "tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wear_log" ADD CONSTRAINT "wear_log_clothing_item_id_clothing_item_id_fk" FOREIGN KEY ("clothing_item_id") REFERENCES "public"."clothing_item"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wear_log" ADD CONSTRAINT "wear_log_outfit_id_outfit_id_fk" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "clothing_color_item_idx" ON "clothing_color" USING btree ("clothing_item_id");--> statement-breakpoint
CREATE INDEX "clothing_season_item_idx" ON "clothing_season" USING btree ("clothing_item_id");--> statement-breakpoint
CREATE INDEX "clothing_tag_item_idx" ON "clothing_tag" USING btree ("clothing_item_id");--> statement-breakpoint
CREATE INDEX "clothing_tag_tag_idx" ON "clothing_tag" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "outfit_user_idx" ON "outfit" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "outfit_item_outfit_idx" ON "outfit_item" USING btree ("outfit_id");--> statement-breakpoint
CREATE INDEX "outfit_item_clothing_idx" ON "outfit_item" USING btree ("clothing_item_id");--> statement-breakpoint
CREATE INDEX "tag_user_idx" ON "tag" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "wear_log_item_idx" ON "wear_log" USING btree ("clothing_item_id");