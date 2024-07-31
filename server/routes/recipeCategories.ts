import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator'
import { getUser } from '../kinde';
import { db } from '../db';
import { insertRecipeCategoriesSchema, recipeCategories as recipeCategoryTable } from '../db/schema/recipeCategories';
import { categories as categoryTable } from '../db/schema/categories';
import { recipes as recipesTable } from '../db/schema/recipes';
import { eq, desc, and, exists } from 'drizzle-orm'

import { createRecipeCategorySchema } from '../sharedTypes';

export const recipeCategoriesRoute = new Hono()
    .get("/byRecipeId/:recipeId{[0-9]+}", getUser, async (c) => {
        const recipeId = Number.parseInt(c.req.param("recipeId"));
        const user = c.var.user;
        const recipeCategories = await db
            .select({
                id: recipeCategoryTable.id,
                categoryId: recipeCategoryTable.categoryId,
                categoryName: categoryTable.categoryName
            })
            .from(recipeCategoryTable)
            .fullJoin(categoryTable, eq(recipeCategoryTable.categoryId, categoryTable.id))
            .where(and(eq(recipeCategoryTable.userId, user.id), eq(recipeCategoryTable.recipeId, recipeId)))
            .then((res) => res);
        if (!recipeCategories) {
            return c.notFound();
        }
        return c.json({ recipeCategories: recipeCategories });
    })
    .post("/", getUser, zValidator("json", createRecipeCategorySchema), async (c) => {
        const recipeCategory = await c.req.valid("json");
        const user = c.var.user;
        const validatedRecipeCategory = insertRecipeCategoriesSchema.parse({
            ...recipeCategory,
            userId: user.id
        });
        const result = await db
            .insert(recipeCategoryTable)
            .values(validatedRecipeCategory)
            .returning()
            .then((res) => res[0]);
        c.status(201);
        return c.json(result);
    })