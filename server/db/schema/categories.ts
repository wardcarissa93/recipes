import { text, pgTable, serial, timestamp } from "drizzle-orm/pg-core"

export const categories = pgTable(
    "categories",
    {
        id: serial("id").primaryKey(),
        categoryName: text("category_name").notNull(),
        createdAt: timestamp('created_at').defaultNow()
    }
);