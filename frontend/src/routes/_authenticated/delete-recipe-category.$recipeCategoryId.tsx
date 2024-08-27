import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    deleteRecipeCategory,
    getCategoryById,
    getRecipeById,
    getRecipeCategoryById,
    getRecipeCategoriesByRecipeIdQueryOptions
} from '../../lib/api'
import { sanitizeString } from '../../lib/utils'
import {
    type FetchedCategory,
    type FetchedRecipe,
    type FetchedRecipeCategory
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/delete-recipe-category/$recipeCategoryId')({
    component: DeleteRecipeCategory
}) 

function DeleteRecipeCategory() {
    const { recipeCategoryId } = Route.useParams();
    const id = parseInt(recipeCategoryId);

    const [recipeCategoryToDelete, setRecipeCategoryToDelete] = useState<FetchedRecipeCategory>();
    useEffect(() => {
        const fetchRecipeCategory = async () => {
            try {
                const fetchedRecipeCategory: FetchedRecipeCategory = await getRecipeCategoryById(recipeCategoryId);
                setRecipeCategoryToDelete(fetchedRecipeCategory);
            } catch (error) {
                console.error("Error fetching recipe's category: ", error);
            }
        }

        fetchRecipeCategory();
    })

    const [categoryName, setCategoryName] = useState('');
    useEffect(() => {
        const fetchCategoryName = async () => {
            try {
                const fetchedCategory: FetchedCategory = await getCategoryById(recipeCategoryToDelete!.recipeCategory.categoryId.toString())
                const sanitizedCategoryName = sanitizeString(fetchedCategory.category.categoryName);
                setCategoryName(sanitizedCategoryName);
            } catch (error) {
                console.error("Error fetching category: ", error);
            }
        };

        if (recipeCategoryToDelete) {
            fetchCategoryName();
        }
    }, [recipeCategoryToDelete]);

    const [recipeId, setRecipeId] = useState('');
    const [recipeTitle, setRecipeTitle] = useState('');
    useEffect(() => {
        const fetchRecipeTitle = async () => {
            try {
                const fetchedRecipe: FetchedRecipe = await getRecipeById(recipeCategoryToDelete!.recipeCategory.recipeId.toString());
                const sanitizedRecipeTitle = sanitizeString(fetchedRecipe.recipe.title);
                setRecipeTitle(sanitizedRecipeTitle);
                setRecipeId(fetchedRecipe.recipe.id.toString());
            } catch (error) {
                console.error("Error fetching recipe: ", error);
            }
        };

        if (recipeCategoryToDelete) {
            fetchRecipeTitle();
        }
    }, [recipeCategoryToDelete]);

    return (
        <div className="p-16">
            <h2 className="text-center pt-4 text-xl text-red-500">Are you sure you want to delete</h2>
            <h2 className="text-center text-xl text-red-500">the category '{categoryName}' from the recipe</h2>
            <h2 className="text-center pb-4 text-xl text-red-500">'{recipeTitle}'?</h2>
            <DeleteRecipeCategoryButton id={id} categoryName={categoryName} recipeId={recipeId} title={recipeTitle}/>
            <Button
                onClick={() => window.history.back()}
                className="mx-auto flex"
            >
                Cancel
            </Button>
        </div>
    )
}

function DeleteRecipeCategoryButton({ id, categoryName, recipeId, title }: { id: number, categoryName: string, recipeId: string, title: string }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipeCategory,
        onError: (error) => {
            console.error('Error deleting category: ', error);
            toast("Error", {
                description: error.message || `Failed to delete category ${categoryName} from ${title}`,
            });
        },
        onSuccess: async () => {
            toast("Category Deleted", {
                description: `Successfully deleted category ${categoryName} from ${title}`,
            })
            await queryClient.invalidateQueries({ queryKey: getRecipeCategoriesByRecipeIdQueryOptions(recipeId).queryKey });
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
            {mutation.isPending ? "..." : <p>Delete Category</p>}
        </Button>
    )
}