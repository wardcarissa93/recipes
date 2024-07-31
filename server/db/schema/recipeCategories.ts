import { text, integer, pgTable, serial, timestamp } from "drizzle-orm/pg-core";
import { recipes } from './recipes';
import { categories } from './categories';

export const recipeCategories = pgTable(
    "recipe-categories",
    {
        id: serial("id").primaryKey(),
        userId: text("user_id").notNull(),
        recipeId: integer("recipe_id").references(() => recipes.id),
        categoryId: integer("category_id").references(() => categories.id),
        createdAt: timestamp('created_at').defaultNow()
    }
);