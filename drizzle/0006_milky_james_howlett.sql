CREATE TABLE "recruitment_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"recruitment_post_id" integer,
	"position" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"message" text,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recruitment_applications" ADD CONSTRAINT "recruitment_applications_recruitment_post_id_recruitment_posts_id_fk" FOREIGN KEY ("recruitment_post_id") REFERENCES "public"."recruitment_posts"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
INSERT INTO "recruitment_applications" (
	"position",
	"name",
	"phone",
	"email",
	"message",
	"status",
	"created_at",
	"updated_at"
)
SELECT
	COALESCE(NULLIF(regexp_replace(split_part(COALESCE("note", ''), E'\n\n', 1), '^Ứng tuyển: ', ''), ''), 'Tin tuyển dụng') AS "position",
	"name",
	"phone",
	"email",
	NULLIF(split_part(COALESCE("note", ''), E'\n\n', 2), '') AS "message",
	COALESCE("status", 'new') AS "status",
	"created_at",
	"updated_at"
FROM "leads"
WHERE "source" = 'recruitment'
AND NOT EXISTS (
	SELECT 1
	FROM "recruitment_applications"
	WHERE "recruitment_applications"."phone" = "leads"."phone"
	AND "recruitment_applications"."created_at" = "leads"."created_at"
);
