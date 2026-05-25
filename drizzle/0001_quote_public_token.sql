ALTER TABLE "quote_requests" ADD COLUMN "public_token" text;--> statement-breakpoint
UPDATE "quote_requests"
SET "public_token" = md5(random()::text || clock_timestamp()::text || id::text) || md5(id::text || clock_timestamp()::text || random()::text)
WHERE "public_token" IS NULL;--> statement-breakpoint
ALTER TABLE "quote_requests" ALTER COLUMN "public_token" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_public_token_unique" UNIQUE("public_token");
