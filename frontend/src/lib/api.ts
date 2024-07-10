import { hc } from 'hono/client'
import { type ApiRoutes } from '../../../server/app'
import { queryOptions } from '@tanstack/react-query'
import { 
    type CreateRecipe,
    type CreateIngredient, 
    type CreateRecipeIngredient,
    type EditIngredient,
    type EditRecipe,
    type EditRecipeIngredient
} from '../../../server/sharedTypes'

const client = hc<ApiRoutes>('/')

export const api = client.api

type ErrorResponse = {
    message?: string;
}

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


export async function getRecipeById(id: string) {
    const res = await api.recipes[`:id{[0-9]+}`].$get({ param: { id: id.toString() } });
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export function getRecipeByIdQueryOptions(id: string) {
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

export async function editRecipe({ id, value }: {id: string, value: EditRecipe }){
    await new Promise((r) => setTimeout(r, 2000));
    const res = await api.recipes[`:id{[0-9]+}`].$put({
        param: { id: id },
        json: value
    });
    if (!res.ok) {
        throw new Error("server error");
    }
    const updatedRecipe = await res.json();
    return updatedRecipe;
}

export function editRecipeQueryOptions(id: string, value: EditRecipe){
    return queryOptions({
        queryKey: ['edit-recipe', id],
        queryFn: () => editRecipe({ id, value }),
        staleTime: 1000 * 60 * 5,
    })
}

export const loadingEditRecipeQueryOptions = queryOptions<{
    recipe?: EditRecipe;
}>({
    queryKey: ['loading-edit-recipe'],
    queryFn: async () => {
        return {};
    },
    staleTime: Infinity,
})

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

export async function getIngredientById(id: string) {
    const res = await api.ingredients[`:id{[0-9]+}`].$get({ param: { id: id.toString() } });
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export function getIngredientByIdQueryOptions(id: string) {
    return queryOptions({
        queryKey: ['get-ingredient-by-id', id],
        queryFn: () => getIngredientById(id),
        staleTime: 1000 * 60 * 5,
    })
}

export async function getIngredientIdByName(name: string) {
    const res = await api.ingredients["name/:name"].$get({
        param: { name: name }
    });
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data.id;
}

// export function getIngredientIdByNameQueryOptions(name: string) {
//     return queryOptions({
//         queryKey: ['get-ingredient-id-by-name', name],
//         queryFn: () => getIngredientIdByName(name),
//         staleTime: 1000 * 60 * 5,
//     })
// }

export async function createIngredient({ value }: { value: CreateIngredient }) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await api.ingredients.$post({ json: value });

    if (!res.ok) {
        const errorData = await res.json();
        if ('message' in errorData) {
            throw new Error(errorData.message)
        }
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

export async function editIngredient({ id, value }: {id: string, value: EditIngredient }) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await api.ingredients[`:id{[0-9]+}`].$put({
        param: { id: id },
        json: value
    });
    if (!res.ok) {
        const errorData: ErrorResponse = await res.json();
        if ('message' in errorData) {
            throw new Error(errorData.message);
        }
        throw new Error("server error");
    }
    const updatedIngredient = await res.json();
    return updatedIngredient;
}

export function editIngredientQueryOptions(id: string, value: EditIngredient) {
    return queryOptions({
        queryKey: ['edit-ingredient', id],
        queryFn: () => editIngredient({ id, value }),
        staleTime: 1000 * 60 * 5,
    });
}

export const loadingEditIngredientQueryOptions = queryOptions<{
    ingredient?: EditIngredient;
}>({
    queryKey: ["loading-edit-ingredient"],
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
        const errorData: ErrorResponse = await res.json();
        if ('message' in errorData) {
            throw new Error(errorData.message);
        } 
        throw new Error("server error");
    }
}







export async function getAllRecipeIngredients() {
    const res = await api.recipeIngredients.$get();
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export const getAllRecipeIngredientsQueryOptions = queryOptions({
    queryKey: ["get-all-recipe-ingredients"],
    queryFn: getAllRecipeIngredients,
    staleTime: 1000 * 60 * 5,
});

export async function getRecipeIngredientById(id: string) {
    const res = await api.recipeIngredients[`:id{[0-9]+}`].$get({ param: { id: id.toString() } });
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export function getRecipeIngredientByIdQueryOptions(id: string) {
    return queryOptions({
        queryKey: ['get-recipe-ingredient-by-id', id],
        queryFn: () => getRecipeIngredientById(id),
        staleTime: 1000 * 60 * 5,
    })
}

export async function getRecipeIngredientsByRecipeId(recipeId: string) {
    const res = await api.recipeIngredients[`byRecipeId/:recipeId{[0-9]+}`].$get({ param: { recipeId: recipeId.toString() } });
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export function getRecipeIngredientsByRecipeIdQueryOptions(recipeId: string) {
    return queryOptions({
        queryKey: ['get-recipe-ingredients-by-recipe-id', recipeId],
        queryFn: () => getRecipeIngredientsByRecipeId(recipeId),
        staleTime: 1000 * 60 * 5,
    })
}

export async function getRecipesByIngredientName(names: string[]) {
    const queryString = names.join(',');
    const res = await api.recipeIngredients[`byIngredientName/:names`].$get({
        param: { names: queryString },
    });
    if (!res.ok) {
        throw new Error("server error");
    }
    const data = await res.json();
    return data;
}

export function getRecipesByIngredientNameQueryOptions(names: string[]) {
    return queryOptions({
        queryKey: ['get-recipes-by-ingredient-name', names],
        queryFn: () => getRecipesByIngredientName(names),
        staleTime: 1000 * 60 * 5,
    })
}

export async function createRecipeIngredient({ value }: { value: CreateRecipeIngredient }) {
    const res = await api.recipeIngredients.$post({ json: value });
    if (!res.ok) {
        const errorResponse = await res.json();
        const errorMessage = errorResponse.error?.issues?.map(issue => issue.message).join(', ') || "server error";
        throw new Error(errorMessage);
    }
    const newRecipeIngredient = await res.json();
    return newRecipeIngredient;
}

export const loadingCreateRecipeIngredientQueryOptions = queryOptions<{
    recipeIngredient?: CreateRecipeIngredient;
}>({
    queryKey: ["loading-create-recipe-ingredient"],
    queryFn: async () => {
        return {};
    },
    staleTime: Infinity,
});

export async function editRecipeIngredient({ id, value }: {id: string, value: EditRecipeIngredient }){
    await new Promise((r) => setTimeout(r, 2000));
    const res = await api.recipeIngredients[`:id{[0-9]+}`].$put({
        param: { id: id },
        json: value
    });
    if (!res.ok) {
        const errorResponse = await res.json();
        const errorMessage = errorResponse.error?.issues?.map(issue => issue.message).join(', ') || "server error";
        throw new Error(errorMessage);
    }
    const updatedRecipeIngredient = await res.json();
    return updatedRecipeIngredient;
}

export function editRecipeIngredientQueryOptions(id: string, value: EditRecipeIngredient ){
    return queryOptions({
        queryKey: ['edit-recipe-ingredient', id],
        queryFn: () => editRecipeIngredient({ id, value }),
        staleTime: 1000 * 60 * 5,
    })
}

export const loadingEditRecipeIngredientQueryOptions = queryOptions<{
    recipeIngredient?: EditRecipeIngredient;
}>({
    queryKey: ['loading-edit-recipe-ingredient'],
    queryFn: async () => {
        return {};
    },
    staleTime: Infinity,
})

export async function deleteRecipeIngredient({ id }: { id: number }) {
    await new Promise((r) => setTimeout(r, 3000));
    const res = await api.recipeIngredients[":id{[0-9]+}"].$delete({
        param: { id: id.toString() },
    });
    if (!res.ok) {
        throw new Error("server error");
    }
}
