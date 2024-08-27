import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { 
    useMutation,
    useQueryClient
} from '@tanstack/react-query'
import {
    deleteRecipeIngredient,
    getIngredientById,
    getRecipeById,
    getRecipeIngredientById,
    getRecipeIngredientsByRecipeIdQueryOptions
} from '@/lib/api'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { sanitizeString } from '../../lib/utils'
import {
    type FetchedIngredient,
    type FetchedRecipe,
    type FetchedRecipeIngredient
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/delete-recipe-ingredient/$recipeIngredientId')({
    component: DeleteRecipeIngredient
})

function DeleteRecipeIngredient() {
    const { recipeIngredientId } = Route.useParams();
    const id = parseInt(recipeIngredientId);

    const [recipeIngredientToDelete, setRecipeIngredientToDelete] = useState<FetchedRecipeIngredient>();
    useEffect(() => {
        const fetchRecipeIngredient = async () => {
            try {
                const fetchedRecipeIngredient: FetchedRecipeIngredient = await getRecipeIngredientById(recipeIngredientId);
                setRecipeIngredientToDelete(fetchedRecipeIngredient);
            } catch (error) {
                console.error("Error fetching ingredient from recipe: ", error);
            }
        };

        fetchRecipeIngredient();
    });

    const [ingredientName, setIngredientName] = useState('');
    useEffect(() => {
        const fetchIngredientName = async () => {
            try {
                const fetchedIngredient: FetchedIngredient = await getIngredientById(recipeIngredientToDelete!.recipeIngredient.ingredientId.toString());
                const sanitizedIngredientName = sanitizeString(fetchedIngredient.ingredient.name);
                setIngredientName(sanitizedIngredientName);
            } catch (error) {
                console.error("Error fetching ingredient: ", error);
            }
        };

        if (recipeIngredientToDelete) {
            fetchIngredientName();
        }
    }, [recipeIngredientToDelete])

    const [recipeId, setRecipeId] = useState('');
    const [recipeTitle, setRecipeTitle] = useState('');
    useEffect(() => {
        const fetchRecipeTitle = async () => {
            try {
                const fetchedRecipe: FetchedRecipe = await getRecipeById(recipeIngredientToDelete!.recipeIngredient.recipeId.toString());
                const sanitizedRecipeTitle = sanitizeString(fetchedRecipe.recipe.title);
                setRecipeTitle(sanitizedRecipeTitle);
                setRecipeId(fetchedRecipe.recipe.id.toString());
            } catch (error) {
                console.error("Error fetching recipe: ", error);
            }
        };

        if (recipeIngredientToDelete) {
            fetchRecipeTitle();
        }
    }, [recipeIngredientToDelete])

    return (
        <div className="p-16">
            <h2 className="text-center pt-4 text-xl text-red-500">Are you sure you want to delete</h2>
            <h2 className="text-center text-xl text-red-500">the ingredient '{ingredientName}' from the recipe</h2>
            <h2 className="text-center pb-4 text-xl text-red-500">'{recipeTitle}'?</h2>
            <DeleteRecipeIngredientButton id={id} name={ingredientName} recipeId={recipeId} title={recipeTitle}/>
            <Button
                onClick={() => window.history.back()}
                className="mx-auto flex"
            >
                Cancel
            </Button>
        </div>
    )
}

function DeleteRecipeIngredientButton({ id, name, recipeId, title }: { id: number, name: string, recipeId: string, title: string }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipeIngredient,
        onError: (error) => {
            console.error('Error deleting ingredient: ', error);
            toast("Error", {
                description: error.message || `Failed to delete ingredient ${name} from ${title}`,
            });
        },
        onSuccess: async () => {
            toast("Ingredient Deleted", {
                description: `Successfully deleted ingredient ${name} from ${title}`,
            })
            await queryClient.invalidateQueries({ queryKey: getRecipeIngredientsByRecipeIdQueryOptions(recipeId).queryKey });
            navigate({ to: `/recipe/${recipeId}`});
        },
    });

    const handleDelete = () => {
        mutation.mutate({ id });
    }

    return (
        <Button
            onClick={handleDelete}
            className="my-8 mx-auto flex hover:bg-red-500"
        >
            {mutation.isPending ? "..." : <p>Delete Ingredient</p>}
        </Button>
    )
}