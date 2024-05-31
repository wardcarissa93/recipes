import { numeric, text, integer, pgTable, serial, index, timestamp } from "drizzle-orm/pg-core"
import { ingredients } from './ingredients';
import { recipes } from './recipes';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

export const recipeIngredients = pgTable(
    "recipe-ingredients",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        recipeId: integer("recipe_id").references(() => recipes.id),
        ingredientId: integer("ingredient_id").references(() => ingredients.id),
        quantity: numeric("quantity").notNull(),
        unit: text("unit").notNull(),
        details: text("details"),
        createdAt: timestamp('created_at').defaultNow()
    }
);

export const insertRecipeIngredientsSchema = createInsertSchema(recipeIngredients, {
    recipeId: z.number(),
    ingredientId: z.number(),
    quantity: z.number(),
    unit: z.string(),
    details: z.string()
});

export const selectRecipeIngredientsSchema = createSelectSchema(recipeIngredients);