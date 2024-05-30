import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getUser } from '../kinde'
import { db } from '../db'
import { 
    recipeIngredients as recipeIngredientTable,
    insertRecipeIngredientsSchema
 } from '../db/schema/recipeIngredients'
import { ingredients as ingredientTable } from '../db/schema/ingredients'
import { recipes as recipeTable } from '../db/schema/recipes'
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
            ...recipeIngredient,
            userId: user.id,
            // quantity: String(recipeIngredient.quantity)
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
    .get("/byRecipeId/:recipeId{[0-9]+}", getUser, async (c) => {
        const recipeId = Number.parseInt(c.req.param("recipeId"));
        const user = c.var.user;
        const recipeIngredients = await db
            .select({
                name: ingredientTable.name,
                quantity: recipeIngredientTable.quantity,
                unit: recipeIngredientTable.unit
            })
            .from(recipeIngredientTable)
            .fullJoin(ingredientTable, eq(recipeIngredientTable.ingredientId, ingredientTable.id))
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(recipeIngredientTable.recipeId, recipeId)))
            .then((res) => res);
        if (!recipeIngredients) {
            return c.notFound();
        }
        return c.json({ recipeIngredients: recipeIngredients });
    })
    .get("byIngredientName/:name", getUser, async (c) => {
        const ingredientName = c.req.param("name");
        const user = c.var.user;
        const recipes = await db
            .select({
                id: recipeTable.id,
                title: recipeTable.title,
                servings: recipeTable.servings
            })
            .from(ingredientTable)
            .fullJoin(recipeIngredientTable, eq(ingredientTable.id, recipeIngredientTable.ingredientId))
            .fullJoin(recipeTable, eq(recipeIngredientTable.recipeId, recipeTable.id))
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(ingredientTable.name, ingredientName)))
            .then((res) => res);
        if (!recipes) {
            return c.notFound();
        }
        return c.json({ recipes: recipes });
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