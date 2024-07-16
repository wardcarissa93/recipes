import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { getUser } from '../kinde'
import { db } from '../db'
import { 
    recipes as recipeTable,
    insertRecipesSchema,
    updateRecipesSchema
} from '../db/schema/recipes'
import { recipeIngredients as recipeIngredientTable } from '../db/schema/recipeIngredients'
import { eq, desc, and, exists } from 'drizzle-orm'

import { createRecipeSchema } from '../sharedTypes'

export const recipesRoute = new Hono()
    .get("/", getUser, async (c) => {
        const user = c.var.user;
        const recipes = await db
            .select({
                id: recipeTable.id,
                title: recipeTable.title
            })
            .from(recipeTable)
            .where(and(
                eq(recipeTable.userId, user.id),
                exists(
                    db.select()
                        .from(recipeIngredientTable)
                        .where(eq(recipeIngredientTable.recipeId, recipeTable.id))
                )
            ))
            .orderBy(recipeTable.title)
            .limit(100);
        return c.json({ recipes: recipes });
    })
    .post("/", getUser, zValidator("json", createRecipeSchema), async (c) => {
        const recipe = await c.req.valid("json");
        const user = c.var.user;
        const validatedRecipe = insertRecipesSchema.parse({
            ...recipe,
            userId: user.id
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
        return c.json({recipe: recipe})
    })
    .put("/:id{[0-9]+}", getUser, zValidator("json", updateRecipesSchema), async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        const { title, description, prepTime, cookTime, totalTime, servings, instructions, url } = await c.req.valid("json");
        const prepTimeAsString = prepTime?.toString() || null;
        const cookTimeAsString = cookTime?.toString() || null;
        const totalTimeAsString = totalTime?.toString() || null;
        const servingsAsString = servings?.toString() || null;
        const recipe = await db
            .update(recipeTable)
            .set({ 
                title, 
                description,
                prepTime: prepTimeAsString,
                cookTime: cookTimeAsString,
                totalTime: totalTimeAsString,
                servings: servingsAsString,
                instructions,
                url 
            })
            .where(and(eq(recipeTable.userId, user.id), eq(recipeTable.id, id)))
            .returning()
            .then((res) => res[0]);
        if (!recipe) {
            return c.notFound();
        }
        return c.json({ recipe: recipe });
    })
    .delete("/:id{[0-9]+}", getUser, async (c) => {
        const id = Number.parseInt(c.req.param("id"));
        const user = c.var.user;
        await db
            .delete(recipeIngredientTable)
            .where(and(eq(recipeIngredientTable.userId, user.id), eq(recipeIngredientTable.recipeId, id)));
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