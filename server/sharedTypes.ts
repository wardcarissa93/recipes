import { 
    insertRecipesSchema,
    updateRecipesSchema
} from "./db/schema/recipes";
import { 
    insertIngredientsSchema,
    updateIngredientSchema
 } from "./db/schema/ingredients";
import { 
    insertRecipeIngredientsSchema,
    updateRecipeIngredientSchema
} from "./db/schema/recipeIngredients";
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

export const createRecipeIngredientSchema = insertRecipeIngredientsSchema.omit({
    userId: true,
    createdAt: true,
    id: true,
});



export const editIngredientSchema = updateIngredientSchema;

export const editRecipeSchema = updateRecipesSchema;

export const editRecipeIngredientSchema = updateRecipeIngredientSchema;




export type CreateRecipe = z.infer<typeof createRecipeSchema>

export type CreateIngredient = z.infer<typeof createIngredientSchema>

export type CreateRecipeIngredient = z.infer<typeof createRecipeIngredientSchema>




export type EditIngredient = z.infer<typeof editIngredientSchema>

export type EditRecipe = z.infer<typeof editRecipeSchema>

export type EditRecipeIngredient = z.infer<typeof editRecipeIngredientSchema>