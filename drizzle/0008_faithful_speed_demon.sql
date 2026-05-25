CREATE TABLE "pricing_packages" (
	"id" serial PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"category" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"cap" text,
	"panels" text,
	"inv" text,
	"bat" text,
	"fit" text,
	"name" text,
	"spec" text,
	"note" text,
	"price" integer,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recruitment_posts" ADD COLUMN "logo" text;