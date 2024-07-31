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
import {
    insertRecipeCategoriesSchema,
    updateRecipeCategorySchema
} from './db/schema/recipeCategories';
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

export const createRecipeCategorySchema = insertRecipeCategoriesSchema.omit({
    userId: true,
    createdAt: true,
    id: true,
});



export const editIngredientSchema = updateIngredientSchema;

export const editRecipeSchema = updateRecipesSchema;

export const editRecipeIngredientSchema = updateRecipeIngredientSchema;

export const editRecipeCategorySchema = updateRecipeCategorySchema;




export type CreateRecipe = z.infer<typeof createRecipeSchema>

export type CreateIngredient = z.infer<typeof createIngredientSchema>

export type CreateRecipeIngredient = z.infer<typeof createRecipeIngredientSchema>

export type CreateRecipeCategory = z.infer<typeof createRecipeCategorySchema>




export type EditIngredient = z.infer<typeof editIngredientSchema>

export type EditRecipe = z.infer<typeof editRecipeSchema>

export type EditRecipeIngredient = z.infer<typeof editRecipeIngredientSchema>

export type EditRecipeCategory = z.infer<typeof editRecipeCategorySchema>