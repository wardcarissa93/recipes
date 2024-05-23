import { numeric, text, pgTable, serial, index, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const recipes = pgTable(
    "recipes",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        title: text("title").notNull(),
        description: text("description"),
        prepTime: numeric("prep_time", { precision: 6, scale: 1 }),
        cookTime: numeric("cook_time", { precision: 6, scale: 1 }),
        totalTime: numeric("total_time", { precision: 6, scale: 1 }).notNull(),
        servings: numeric("servings", { precision: 2, scale: 1 }).notNull(),
        instructions: text("instructions").notNull(),
        url: text("url"),
        createdAt: timestamp('created_at').defaultNow()
    },
    (recipes) => {
        return {
            userIdIndex: index("name_idx").on(recipes.userId),
        };
    }
);

export const insertRecipesSchema = createInsertSchema(recipes, {
    title: z.string(),
    description: z.string().optional(),
    prepTime: z.string().regex(/^\d+(\.\d{1})?$/, { message: "Prep time must be a valid number with up to one decimal place" }).optional(),
    cookTime: z.string().regex(/^\d+(\.\d{1})?$/, { message: "Cook time must be a valid number with up to one decimal place" }).optional(),
    totalTime: z.string().regex(/^\d+(\.\d{1})?$/, { message: "Total time must be a valid number with up to one decimal place" }),
    servings: z.string().regex(/^\d+(\.\d{1})?$/, { message: "Servings must be a valid number with up to one decimal place" }),
    instructions: z.string(),
    url: z.string().url().optional()
});

export const selectRecipesSchema = createSelectSchema(recipes);