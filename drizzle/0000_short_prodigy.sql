CREATE TABLE "articles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"category" text DEFAULT 'tin-tuc',
	"cover_image" text,
	"published" boolean DEFAULT false,
	"published_at" timestamp,
	"seo_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "articles_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor" text,
	"entity_type" text,
	"entity_id" text,
	"event" text NOT NULL,
	"payload_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text,
	"address" text,
	"province" text,
	"district" text,
	"ward" text,
	"source" text DEFAULT 'website',
	"status" text DEFAULT 'new',
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo" text,
	"type" text DEFAULT 'supplier',
	"url" text,
	"sort_order" integer DEFAULT 0,
	"active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"location" text,
	"capacity_kwp" real,
	"customer_type" text,
	"cover_image" text,
	"content" text,
	"metrics_json" jsonb,
	"published" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "quote_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"payment_mode" text NOT NULL,
	"customer_type" text NOT NULL,
	"monthly_bill_vnd" integer NOT NULL,
	"daytime_usage_rate" real NOT NULL,
	"roof_area_sqm" real,
	"battery_option" boolean DEFAULT false,
	"location_json" jsonb,
	"input_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quote_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"quote_request_id" integer,
	"recommended_capacity_kwp" real NOT NULL,
	"estimated_investment_vnd" integer NOT NULL,
	"annual_production_kwh" real NOT NULL,
	"annual_savings_vnd" integer NOT NULL,
	"payback_years" real NOT NULL,
	"irr_percent" real,
	"installment_plans_json" jsonb,
	"result_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value_json" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_requests" ADD CONSTRAINT "quote_requests_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_results" ADD CONSTRAINT "quote_results_quote_request_id_quote_requests_id_fk" FOREIGN KEY ("quote_request_id") REFERENCES "public"."quote_requests"("id") ON DELETE no action ON UPDATE no action;