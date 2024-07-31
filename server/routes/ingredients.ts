import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

import { getUser } from '../kinde'

import { db } from '../db'
import { 
    ingredients as ingredientTable,
    insertIngredientsSchema,
    updateIngredientSchema
} from '../db/schema/ingredients'
import { recipeIngredients as recipeIngredientTable } from '../db/schema/recipeIngredients'
import { eq, and } from 'drizzle-orm'

import { createIngredientSchema } from '../sharedTypes'

export const ingredientsRoute = new Hono()
    .get("/", getUser, async (c) => {
        const user = c.var.user;
        const ingredients = await db
            .select()
            .from(ingredientTable)
            .where(eq(ingredientTable.userId, user.id))
            .orderBy(ingredientTable.name);
        return c.json({ ingredients: ingredients });
    })
    .post("/", getUser, zValidator("json", createIngredientSchema), async (c) => {
        const ingredient = await c.req.valid("json");
        const user = c.var.user;
        const existingIngredient = await db
            .select()
            .from(ingredientTable)
            .where(and(eq(ingredientTable.userId, user.id), eq(ingredientTable.name, ingredient.name)))
            .then((res) => res[0]);

        if (existingIngredient) {
            c.status(409);
            return c.json({ message: "Ingredient already in database" });
        }
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
        return c.json({ ingredient: ingredient })
    })
    .get("/name/:name", getUser, async (c) => {
        const name = c.req.param("name");
        const user = c.var.user;
        const ingredient = await db
            .select()
            .from(ingredientTable)
            .where(and(eq(ingredientTable.userId, user.id), eq(ingredientTable.name, name)))
            .then((res) => res[0]);
        if (!ingredient) {
            return c.notFound();
        }
        return c.json({ id: ingredient.id });
    })
    .put("/:id{[0-9]+}", getUser, zValidator("json", updateIngredientSchema), async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const { name } = await c.req.valid("json");
        const user = c.var.user;
        const existingIngredient = await db
            .select()
            .from(ingredientTable)
            .where(and(eq(ingredientTable.userId, user.id), eq(ingredientTable.name, name)))
            .then((res) => res[0]);
        if (existingIngredient) {
            c.status(409);
            return c.json({ message: "Ingredient already in database" });
        }
        const ingredient = await db
            .update(ingredientTable)
            .set({ name })
            .where(and(eq(ingredientTable.userId, user.id), eq(ingredientTable.id, id)))
            .returning()
            .then((res) => res[0]);
        if (!ingredient) {
            return c.notFound();
        }
        return c.json({ ingredient: ingredient });
    })
    .delete("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user; 
        // Check if the ingredient is being used in any recipes
        const isUsed = await db
            .select()
            .from(recipeIngredientTable)
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(recipeIngredientTable.ingredientId, id)))
            .limit(1)
            .then((res) => res.length > 0); 
        if (isUsed) {
            c.status(409);
            return c.json({ message: "Ingredient is being used in a recipe and cannot be deleted." });
        }
        // Proceed with deletion if not used in any recipes
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