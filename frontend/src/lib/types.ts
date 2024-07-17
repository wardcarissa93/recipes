export type ErrorResponse = {
    message?: string;
}

export type ExistingRecipeIngredients = {
    recipeIngredients: RecipeIngredient[]
}

export type FetchedIngredient = {
    ingredient: Ingredient
}

export type FetchedRecipe = {
    recipe: Recipe
}

export type FetchedRecipeIngredient = {
    recipeIngredient: RecipeIngredient
}

export type Ingredient = {
    id: number,
    userId: string,
    name: string,
    createdAt: string | null
}

export type IngredientOption = {
    label: string;
    value: string;
}

export type NewRecipeIngredient = {
    name: string;
    quantity: number;
    unit: string;
    details: '';
}

export type Recipe = {
    id: number;
    title: string;
    description?: string;
    prepTime?: string;
    cookTime?: string;
    totalTime?: string;
    servings?: string;
    instructions?: string;
    url?: string;
    ingredients?: string[];
}

export type RecipeIngredient = {
    id: number;
    ingredientId: number;
    recipeId: number;
    name: string;
    quantity: string;
    unit: string;
    details?: string;
}

export type SearchResult = {
    id: number;
    ingredients?: string[];
    title: string;
}