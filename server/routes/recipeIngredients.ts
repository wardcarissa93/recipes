import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getUser } from '../kinde'
import { db } from '../db'
import { 
    recipeIngredients as recipeIngredientTable,
    insertRecipeIngredientsSchema,
    updateRecipeIngredientSchema
 } from '../db/schema/recipeIngredients'
import { ingredients as ingredientTable } from '../db/schema/ingredients'
import { recipes as recipeTable } from '../db/schema/recipes'
import { eq, desc, and, inArray, sql } from 'drizzle-orm'

import { createRecipeIngredientSchema } from '../sharedTypes'

 export const recipeIngredientsRoute = new Hono()
    .get("/", getUser, async (c) => {
        const user = c.var.user;
        const recipeIngredients = await db
            .select()
            .from(recipeIngredientTable)
            .where(eq(recipeIngredientTable.userId, user.id))
            .orderBy(desc(recipeIngredientTable.createdAt));
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
            .select({
                id: recipeIngredientTable.id,
                recipeId: recipeIngredientTable.recipeId,
                ingredientId: recipeIngredientTable.ingredientId,
                name: ingredientTable.name,
                quantity: recipeIngredientTable.quantity,
                unit: recipeIngredientTable.unit,
                details: recipeIngredientTable.details
            })
            .from(recipeIngredientTable)
            .fullJoin(ingredientTable, eq(recipeIngredientTable.ingredientId, ingredientTable.id))
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
                id: recipeIngredientTable.id,
                name: ingredientTable.name,
                quantity: recipeIngredientTable.quantity,
                unit: recipeIngredientTable.unit,
                details: recipeIngredientTable.details
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
    .get("/byIngredientName/:names", getUser, async (c) => {
        const ingredientNames = c.req.param("names").split(",").map(name => name.trim());
        const user = c.var.user;
        const recipes = await db
            .select({
                id: recipeTable.id,
                title: recipeTable.title,
                ingredients: sql<string[]>`ARRAY_AGG(${ingredientTable.name})`
            })
            .from(recipeTable)
            .fullJoin(recipeIngredientTable, eq(recipeTable.id, recipeIngredientTable.recipeId))
            .fullJoin(ingredientTable, eq(recipeIngredientTable.ingredientId, ingredientTable.id))
            .where(and(eq(recipeIngredientTable.userId, user.id), inArray(ingredientTable.name, ingredientNames)))
            .groupBy(recipeTable.id)
            .then((res) => res);

        if (!recipes) {
            return c.notFound();
        }
        return c.json({ recipes: recipes });
    })
    .put("/:id{[0-9]+}", getUser, zValidator("json", updateRecipeIngredientSchema), async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const { recipeId, ingredientId, quantity, unit, details } = await c.req.valid("json");
        const quantityAsString = quantity.toString();
        const recipeIngredient = await db
            .update(recipeIngredientTable)
            .set({
                ingredientId,
                quantity: quantityAsString,
                unit,
                details
            })
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(recipeIngredientTable.id, id), eq(recipeIngredientTable.recipeId, recipeId)))
            .returning()
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