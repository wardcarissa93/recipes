import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
    deleteRecipe,
    getRecipeById
} from '@/lib/api'
import { toast } from 'sonner'
import { sanitizeString } from '../../lib/utils'
import { type FetchedRecipe } from '../../lib/types'

export const Route = createFileRoute('/_authenticated/delete-recipe/$recipeId')({
    component: DeleteRecipe
})

function DeleteRecipe() {
    const { recipeId } = Route.useParams();
    const id = parseInt(recipeId);

    const [recipeTitle, setRecipeTitle] = useState('');
    useEffect(() => {
        const fetchRecipeTitle = async () => {
            try {
                const fetchedRecipe: FetchedRecipe = await getRecipeById(recipeId);
                const sanitizedRecipeTitle = sanitizeString(fetchedRecipe.recipe.title);
                setRecipeTitle(sanitizedRecipeTitle);
            } catch (error) {
                console.error("Error fetching recipe: ", error);
            }
        };

        fetchRecipeTitle();
    });

    return (
        <div className="p-16">
            <h2 className="text-center pt-4 text-xl text-red-500">Are you sure you want to delete</h2>
            <h2 className="text-center pb-4 text-xl text-red-500">the recipe '{recipeTitle}'?</h2>
            <DeleteRecipeButton id={id} title={recipeTitle} />
            <Button
                onClick={() => window.history.back()}
                className="mx-auto flex"
            >
                Cancel
            </Button>
        </div>
    )
}

function DeleteRecipeButton({ id, title }: { id: number, title: string }) {
    const navigate = useNavigate();
    const mutation = useMutation({
        mutationFn: deleteRecipe,
        onError: (error) => {
            console.error('Error deleting recipe: ', error);
            toast("Error", {
                description: error.message || `Failed to delete recipe '${title}'`,
            });
        },
        onSuccess: () => {
            toast("Recipe Deleted", {
                description: `Successfully deleted recipe '${title}'`,
            })
            navigate({to: '/my-recipes'});
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
            {mutation.isPending ? "..." : <p>Delete Recipe</p>}
        </Button>
    )
}