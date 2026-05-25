CREATE TABLE "recruitment_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"department" text,
	"location" text,
	"employment_type" text DEFAULT 'full-time',
	"salary_range" text,
	"deadline" timestamp,
	"published" boolean DEFAULT false,
	"published_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "recruitment_posts_slug_unique" UNIQUE("slug")
);
