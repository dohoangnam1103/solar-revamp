CREATE TABLE "carousel_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_asset_id" integer NOT NULL,
	"alt" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"storage_path" text NOT NULL,
	"original_name" text,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"usage" text DEFAULT 'general' NOT NULL,
	"alt" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_storage_path_unique" UNIQUE("storage_path")
);
--> statement-breakpoint
ALTER TABLE "carousel_images" ADD CONSTRAINT "carousel_images_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;