import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { getUser } from '../kinde'
import { db } from '../db'
import { 
    recipeIngredients as recipeIngredientTable,
    insertRecipeIngredientsSchema
 } from '../db/schema/recipeIngredients'
 import { eq, desc, and } from 'drizzle-orm'

 import { createRecipeIngredientSchema } from '../sharedTypes'

 export const recipeIngredientsRoute = new Hono()
    .get("/", getUser, async (c) => {
        const user = c.var.user;
        const recipeIngredients = await db
            .select()
            .from(recipeIngredientTable)
            .where(eq(recipeIngredientTable.userId, user.id))
            .orderBy(desc(recipeIngredientTable.createdAt))
            .limit(100);
        return c.json({ recipeIngredients: recipeIngredients });
    })
    .post("/", getUser, zValidator("json", createRecipeIngredientSchema), async (c) => {
        const recipeIngredient = await c.req.valid("json");
        const user = c.var.user;
        const validatedRecipeIngredient = insertRecipeIngredientsSchema.parse({
            ...recipeIngredientTable,
            userId: user.id,
            quantity: String(recipeIngredient.quantity)
        });
        const result = await db
            .insert(recipeIngredientTable)
            .values(validatedRecipeIngredient)
            .returning()
            .then((res) => res[0]);
        c.status(201);
        return c.json(result);
    })
    .get("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const recipeIngredient = await db
            .select()
            .from(recipeIngredientTable)
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(recipeIngredientTable.id, id)))
            .then((res) => res[0]);
        if (!recipeIngredient) {
            return c.notFound();
        }
        return c.json({ recipeIngredient: recipeIngredient });
    })
    .delete("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const recipeIngredient = await db
            .delete(recipeIngredientTable)
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(recipeIngredientTable.id, id)))
            .returning()
            .then((res) => res[0]);
        if (!recipeIngredient) {
            return c.notFound();
        }
        return c.json({ recipeIngredient: recipeIngredient });
    });