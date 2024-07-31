import { Hono } from 'hono';
import { db } from '../db';
import { categories as categoryTable } from '../db/schema/categories';
import { eq } from 'drizzle-orm'

export const categoriesRoute = new Hono()
    .get("/", async (c) => {
        const categories = await db
            .select()
            .from(categoryTable)
            .orderBy(categoryTable.categoryName);
        return c.json({ categories: categories });
    })
    .get("/categoryName/:categoryName", async (c) => {
        const categoryName = c.req.param("categoryName");
        const category = await db
            .select()
            .from(categoryTable)
            .where(eq(categoryTable.categoryName, categoryName))
            .then((res) => res[0]);
        if (!category) {
            return c.notFound();
        }
        return c.json({ category: category });
    });