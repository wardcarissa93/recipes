import { hc } from 'hono/client'
import { type ApiRoutes } from '../../../server/app'
import { queryOptions } from '@tanstack/react-query'
import { 
    type CreateRecipe,
    type CreateIngredient 
} from '../../../server/sharedTypes'

const client = hc<ApiRoutes>('/')

export const api = client.api

async function getCurrentUser() {
    const res = await api.me.$get();
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export const userQueryOptions = queryOptions({
    queryKey: ["get-current-user"],
    queryFn: getCurrentUser,
    staleTime: Infinity
})

export async function getAllRecipes() {
    const res = await api.recipes.$get();
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export const getAllRecipesQueryOptions = queryOptions({
    queryKey: ["get-all-recipes"],
    queryFn: getAllRecipes,
    staleTime: 1000 * 60 * 5,
});


export async function getRecipeById(id: number) {
    const res = await api.recipes[`:id{[0-9]+}`].$get({ param: { id: id.toString() } });
    console.log("res: ", res)
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

// export const getRecipeByIdQueryOptions = (id: number) => queryOptions({
//     queryKey: ["get-recipe-by-id", id],
//     queryFn: () => getRecipeById(id),
//     staleTime: 1000 * 60 * 5,
// });

export function getRecipeByIdQueryOptions(id: number) {
    return queryOptions({
        queryKey: ['get-recipe-by-id', id],
        queryFn: () => getRecipeById(id),
        staleTime: 1000 * 60 * 5,
    })
}

export async function createRecipe({ value }: { value: CreateRecipe }) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await api.recipes.$post({ json: value });
    if (!res.ok) {
        throw new Error("server error");
    }
    const newRecipe = await res.json();
    return newRecipe;
}

export const loadingCreateRecipeQueryOptions = queryOptions<{
    recipe?: CreateRecipe;
}>({
    queryKey: ["loading-create-recipe"],
    queryFn: async () => {
        return {};
    },
    staleTime: Infinity,
});

export async function deleteRecipe({ id }: { id: number }) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await api.recipes[":id{[0-9]+}"].$delete({
        param: { id: id.toString() },
    });
    if (!res.ok) {
        throw new Error("server error");
    }
}

export async function getAllIngredients() {
    const res = await api.ingredients.$get();
    if (!res.ok) {
        throw new Error("server error")
    }
    const data = await res.json();
    return data;
}

export const getAllIngredientsQueryOptions = queryOptions({
    queryKey: ["get-all-ingredients"],
    queryFn: getAllIngredients,
    staleTime: 1000 * 60 * 5,
});

export async function createIngredient({ value }: { value: CreateIngredient }) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await api.ingredients.$post({ json: value });
    if (!res.ok) {
        throw new Error("server error");
    }
    const newIngredient = await res.json();
    return newIngredient;
}

export const loadingCreateIngredientQueryOptions = queryOptions<{
    ingredient?: CreateIngredient;
}>({
    queryKey: ["loading-create-ingredient"],
    queryFn: async () => {
        return {};
    },
    staleTime: Infinity,
});

export async function deleteIngredient({ id }: { id: number }) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await api.ingredients[":id{[0-9]+}"].$delete({
        param: { id: id.toString() },
    });
    if (!res.ok) {
        throw new Error("server error");
    }
}