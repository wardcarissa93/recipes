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
        prepTime: numeric("prep_time", { precision: 6, scale: 0 }),
        cookTime: numeric("cook_time", { precision: 6, scale: 0 }),
        totalTime: numeric("total_time", { precision: 6, scale: 0 }),
        servings: numeric("servings", { precision: 2, scale: 0 }),
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
    title: z
        .string()
        .min(1, { message: "'Title' is required." } ),
    description: z
        .string()
        .nullable(),
    prepTime: z
        .number()
        .nonnegative({ message: "'Prep Time' cannot be negative." } )
        .nullable(),
    cookTime: z
        .number()
        .nonnegative({ message: "'Cook Time' cannot be negative." } )
        .nullable(),
    totalTime: z
        .number()
        .nonnegative({ message: "'Total Time' cannot be negative." } )
        .nullable(),
    servings: z
        .number()
        .nonnegative({ message: "'Servings' cannot be negative." } )
        .nullable(),
    instructions: z
        .string()
        .min(1, { message: "'Instructions' is required." } ),
    url: z
        .string()
        .nullable()
});

export const selectRecipesSchema = createSelectSchema(recipes);

export const updateRecipesSchema = z.object({
    title: z
        .string()
        .min(1, { message: "'Title' is required." } ),
    description: z
        .string()
        .nullable(),
    prepTime: z
        .number()
        .nonnegative({ message: "'Prep Time' cannot be negative." } )
        .nullable(),
    cookTime: z
        .number()
        .nonnegative({ message: "'Cook Time' cannot be negative." } )
        .nullable(),
    totalTime: z
        .number()
        .nonnegative({ message: "'Total Time' cannot be negative." } )
        .nullable(),
    servings: z
        .number()
        .nonnegative({ message: "'Servings' cannot be negative." } )
        .nullable(),
    instructions: z
        .string()
        .min(1, { message: "'Instructions' is required." } ),
    url: z
        .string()
        .nullable()
})