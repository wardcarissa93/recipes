import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { sanitizeString } from '../../lib/utils'
import { 
    deleteRecipeIngredient,
    getRecipeByIdQueryOptions,
    getRecipeIngredientsByRecipeIdQueryOptions,
    deleteRecipe,
    getAllRecipesQueryOptions
 } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Trash, Edit } from 'lucide-react';
import { toast } from 'sonner';

type Ingredient = {
    id: number,
    name: string,
    quantity: number,
    unit: string,
    details?: string | null
}

export const Route = createFileRoute('/_authenticated/recipe/$recipeId')({
    component: RecipeDetails
});

function RecipeDetails() {
    const { recipeId } = Route.useParams();

    const { isPending: recipePending, error: recipeError, data: recipeData } = useQuery(getRecipeByIdQueryOptions(recipeId));
    const { isPending: ingredientsPending, error: ingredientsError, data: ingredientsData } = useQuery(getRecipeIngredientsByRecipeIdQueryOptions(recipeId));

    const recipe = recipeData?.recipe;
    const sanitizedTitle = recipe ? sanitizeString(recipe.title) : '';

    let sanitizedDescription = '';
    let sanitizedInstructions = '';
    let sanitizedUrl = '';
    if (recipe) {
        if (recipe.description) {
            const formattedDescription = recipe.description.replace(/\n/g, '<br>');
            sanitizedDescription = sanitizeString(formattedDescription);
        }
        const formattedInstructions = recipe.instructions.replace(/\n/g, '<br>');
        sanitizedInstructions = sanitizeString(formattedInstructions);
        if (recipe.url) {
            sanitizedUrl = sanitizeString(recipe.url);
        }
    }

    const sanitizedIngredients = ingredientsData?.recipeIngredients.map((ingredient: Ingredient) => ({
        ...ingredient,
        name: sanitizeString(ingredient.name),
        quantity: ingredient.quantity,
        unit: sanitizeString(ingredient.unit),
        details: ingredient.details ? sanitizeString(ingredient.details) : null
    }));

    // const ingredients: Ingredient[] = ingredientsData?.recipeIngredients;

    if (recipeError) return 'An error has occurred: ' + recipeError.message;
    if (ingredientsError) return 'An error has occurred: ' + ingredientsError.message;

    return (
        <div>
            {(!recipePending) && (
                <div className="p-2 max-w-3xl m-auto">
                    <Button onClick={() => window.history.back()}>
                        Back
                    </Button>
                    <div className="text-center p-4">
                        {sanitizedUrl ? (
                            <a href={sanitizedUrl} target="_blank" rel="noopener noreferrer" className="text-2xl font-bold hover:text-indigo-400">
                            {sanitizedTitle}
                            </a>
                        ) : (
                            <h1 className="text-2xl font-bold">{sanitizedTitle}</h1>
                        )}
                        <p dangerouslySetInnerHTML={{ __html: sanitizedDescription }} className="italic" />
                    </div>
                    <p className="text-center my-4">Servings: {recipe.servings ? (recipe.servings) : "N/A"}</p>
                    <div className="flex justify-between max-w-lg m-auto">
                        <p>Prep Time: {recipe.prepTime ? (recipe.prepTime + " min") : "N/A"}</p>
                        <p>Cook Time: {recipe.cookTime ? (recipe.cookTime + " min") : "N/A"}</p>
                        <p>Total Time: {recipe.totalTime ? (recipe.totalTime + " min") : "N/A"}</p>
                    </div>
                    {(ingredientsPending) ? (
                        <div>
                            <p>Ingredients loading...</p>
                        </div>
                    ) : (
                        <div className="my-8">
                            <hr />
                            <h3 className="text-center p-2 my-4 text-lg font-bold">Ingredients</h3>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {sanitizedIngredients.map((ingredient: Ingredient) => (
                                    <div key={ingredient.name} className="flex items-center">
                                        <EditRecipeIngredientButton id={ingredient.id}/>
                                        <DeleteRecipeIngredientButton id={ingredient.id} recipeId={recipeId} name={ingredient.name} />
                                        <p className="ml-2 max-w-[250px]">
                                            {(ingredient.quantity > 0) && ingredient.quantity} {ingredient.unit} {ingredient.name}
                                            {ingredient.details && (<span>, {ingredient.details}</span>)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <hr />
                        </div>
                    )}
                    <h3 className="text-center mb-4 text-lg font-bold">Instructions</h3>
                    <p dangerouslySetInnerHTML={{ __html: sanitizedInstructions }} className="p-2"/>
                    <div className="flex justify-between my-8">
                        <EditRecipeButton id={recipe.id} />
                        <AddRecipeIngredientButton id={recipe.id}/>
                        <DeleteRecipeButton id={recipe.id} title={recipe.title} />
                    </div>
                    <Button onClick={() => window.history.back()} className="m-auto flex">
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}

function EditRecipeButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const navigateToEditRecipe = () => {
        navigate({
            to: `/edit-recipe/$recipeId`,
            params: { recipeId: id.toString() }
        });
    };

    return (
        <Button 
            onClick={navigateToEditRecipe}
        >
            <p>Edit Recipe Details</p>
        </Button>
    )
}

function DeleteRecipeButton({ id, title }: { id: number, title: string }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
            queryClient.setQueryData(
                getAllRecipesQueryOptions.queryKey,
                (existingRecipes) => ({
                    ...existingRecipes,
                    recipes: existingRecipes!.recipes.filter((e) => e.id !== id),
                })
            );
            navigate({to: '/my-recipes'});
        },
    });

    return (
        <Button
            onClick={() => mutation.mutate({ id })}
            className="w-[150px] hover:bg-red-500"
        >
            {mutation.isPending ? "..." : <p>Delete Recipe</p>}
        </Button>
    );
}

function EditRecipeIngredientButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const navigateToEditRecipeIngredient = () => {
        navigate({
            to: "/edit-recipe-ingredient/$recipeIngredientId",
            params: { recipeIngredientId: id.toString() }
        });
    };

    return (
        <Button 
            onClick={navigateToEditRecipeIngredient}
            variant="outline"
            size="icon"
        >
            <Edit className="h-4 w-4"/>
        </Button>
    )
}

function AddRecipeIngredientButton({ id }: { id: number}) {
    const navigate = useNavigate();
    const navigateToAddRecipeIngredient = () => {
        navigate({
            to: "/add-recipe-ingredient/$recipeId",
            params: { recipeId: id.toString() }
        });
    };

    return (
        <Button
            onClick={navigateToAddRecipeIngredient}
        >
            Add Ingredient to Recipe
        </Button>
    )
}

function DeleteRecipeIngredientButton({ id, recipeId, name }: { id: number, recipeId: string, name: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipeIngredient,
        onError: (error) => {
            console.error('Error deleting ingredient:', error);
            toast("Error", {
                description: error.message || `Failed to delete ingredient: ${name}`,
            });
        },
        onSuccess: () => {
            toast("Ingredient Deleted", {
                description: `Successfully deleted ingredient: ${name}`,
            })
            queryClient.setQueryData(
                getRecipeIngredientsByRecipeIdQueryOptions(recipeId).queryKey,
                (existingRecipeIngredients) => ({
                    ...existingRecipeIngredients,
                    recipeIngredients: existingRecipeIngredients!.recipeIngredients.filter((e) => e.id !== id),
                })
            );
        },
    });

    return (
        <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id })}
            variant="outline"
            size="icon"
            className="hover:bg-red-500"
        >
            {mutation.isPending ? "..." : <Trash className='h-4 w-4' />}
        </Button>
    );
}