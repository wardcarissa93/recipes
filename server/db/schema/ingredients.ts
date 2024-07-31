import { text, pgTable, serial, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const ingredients = pgTable(
    "ingredients",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        name: text("name").notNull(),
        createdAt: timestamp('created_at').defaultNow()
    }
)

export const insertIngredientsSchema = createInsertSchema(ingredients, {
    name: z
        .string()
        .min(1, { message: "'Ingredient Name' is required."} ),
});

// export const selectIngredientsSchema = createSelectSchema(ingredients);

export const updateIngredientSchema = z.object({
    name: z
        .string()
        .min(1, { message: "'Ingredient Name' is required."} )
});