CREATE TABLE IF NOT EXISTS "recipes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"prep_time" numeric(6, 1),
	"cook_time" numeric(6, 1),
	"total_time" numeric(6, 1) NOT NULL,
	"servings" numeric(2, 1) NOT NULL,
	"instructions" text NOT NULL,
	"url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "recipes" ("user_id");