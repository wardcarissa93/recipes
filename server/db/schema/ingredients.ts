import { numeric, text, pgTable, serial, index, timestamp } from "drizzle-orm/pg-core"
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
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
    name: z.string(),
});

export const selectIngredientsSchema = createSelectSchema(ingredients);