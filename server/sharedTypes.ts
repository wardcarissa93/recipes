import { insertRecipesSchema } from "./db/schema/recipes";
import { z } from 'zod';

export const createRecipeSchema = insertRecipesSchema.omit({
    userId: true,
    createdAt: true,
    id: true,
});

export type CreateRecipe = z.infer<typeof createRecipeSchema>