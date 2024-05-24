import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { getUser } from '../kinde'

import { db } from '../db'
import { ingredients as ingredientTable,
    insertIngredientsSchema
} from '../db/schema/ingredients'
import { eq, desc, and } from 'drizzle-orm'

import { createIngredientSchema } from '../sharedTypes'
import { UserIdentitiesInnerFromJSON } from '@kinde-oss/kinde-typescript-sdk'

export const ingredientsRoute = new Hono()
    .get("/", getUser, async (c) => {
        const user = c.var.user;
        const ingredients = await db
            .select()
            .from(ingredientTable)
            .where(eq(ingredientTable.userId, user.id))
            .orderBy(desc(ingredientTable.createdAt))
            .limit(100);
        return c.json({ ingredients: ingredients });
    })
    .post("/", getUser, zValidator("json", createIngredientSchema), async (c) => {
        const ingredient = await c.req.valid("json");
        const user = c.var.user;
        const validatedIngredient = insertIngredientsSchema.parse({
            ...ingredient,
            userId: user.id
        });
        const result = await db
            .insert(ingredientTable)
            .values(validatedIngredient)
            .returning()
            .then((res) => res[0]);
        c.status(201);
        return c.json(result);
    })
    .get("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const ingredient = await db
            .select()
            .from(ingredientTable)
            .where(and(eq(ingredientTable.userId, user.id), eq(ingredientTable.id, id)))
            .then((res) => res[0]);
        if (!ingredient) {
            return c.notFound();
        }
        return c.json({ })
    })
    .delete("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"))
        const user = c.var.user;
        const ingredient = await db
            .delete(ingredientTable)
            .where(and(eq(ingredientTable.userId, user.id), eq(ingredientTable.id, id)))
            .returning()
            .then((res) => res[0]);
        if (!ingredient) {
            return c.notFound();
        }
        return c.json({ ingredient: ingredient });
    });