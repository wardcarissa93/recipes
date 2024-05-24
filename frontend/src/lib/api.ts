import { hc } from 'hono/client'
import { type ApiRoutes } from '../../../server/app'
import { queryOptions } from '@tanstack/react-query'
import { type CreateRecipe } from '../../../server/sharedTypes'

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