import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { getUser } from '../kinde'

import { db } from '../db'
import { recipes as recipeTable,
    insertRecipesSchema
} from '../db/schema/recipes'
import { eq, desc, and } from 'drizzle-orm'

import { createRecipeSchema } from '../sharedTypes'

export const recipesRoute = new Hono()
    .get("/", getUser, async (c) => {
        const user = c.var.user;
        const recipes = await db
            .select()
            .from(recipeTable)
            .where(eq(recipeTable.userId, user.id))
            .orderBy(desc(recipeTable.createdAt))
            .limit(100);
        return c.json({ recipes: recipes });
    })
    .post("/", getUser, zValidator("json", createRecipeSchema), async (c) => {
        const recipe = await c.req.valid("json");
        const user = c.var.user;
        const validatedRecipe = insertRecipesSchema.parse({
            ...recipe,
            userId: user.id,
        });
        const result = await db
            .insert(recipeTable)
            .values(validatedRecipe)
            .returning()
            .then((res) => res[0]);
        c.status(201);
        return c.json(result);
    })
    .get("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const recipe = await db
            .select()
            .from(recipeTable)
            .where(and(eq(recipeTable.userId, user.id), eq(recipeTable.id, id)))
            .then((res) => res[0]);
        if (!recipe) {
            return c.notFound();
        }
        return c.json({ })
    })
    .delete("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const recipe = await db
            .delete(recipeTable)
            .where(and(eq(recipeTable.userId, user.id), eq(recipeTable.id, id)))
            .returning()
            .then((res) => res[0]);
        if (!recipe) {
            return c.notFound();
        }
        return c.json({ recipe: recipe });
    });