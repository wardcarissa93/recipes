import { insertRecipesSchema } from "./db/schema/recipes";
import { insertIngredientsSchema } from "./db/schema/ingredients";
import { z } from 'zod';

export const createRecipeSchema = insertRecipesSchema.omit({
    userId: true,
    createdAt: true,
    id: true,
});

export const createIngredientSchema = insertIngredientsSchema.omit({
    userId: true,
    createdAt: true,
    id: true,
});

export type CreateRecipe = z.infer<typeof createRecipeSchema>

export type CreateIngredient = z.infer<typeof createIngredientSchema>