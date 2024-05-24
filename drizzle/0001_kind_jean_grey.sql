ALTER TABLE "recipes" ALTER COLUMN "prep_time" SET DATA TYPE numeric(6, 0);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "cook_time" SET DATA TYPE numeric(6, 0);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "total_time" SET DATA TYPE numeric(6, 0);--> statement-breakpoint
ALTER TABLE "recipes" ALTER COLUMN "servings" SET DATA TYPE numeric(2, 0);