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
    console.log("RECIPE: ", recipe)
    const sanitizedTitle = recipe ? sanitizeString(recipe.title) : '';

    let sanitizedInstructions = '';
    if (recipe) {
        const formattedInstructions = recipe.instructions.replace(/\n/g, '<br>');
        sanitizedInstructions = sanitizeString(formattedInstructions);
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
                    <h1 className="text-2xl font-bold">{sanitizedTitle}</h1>
                    <p>Servings: {recipe.servings}</p>
                    <p>Total Time: {recipe.totalTime}</p>
                    {(ingredientsPending) ? (
                        <div>
                            <p>Ingredients loading...</p>
                        </div>
                    ) : (
                        <div>
                        <h3>Ingredients:</h3>
                        <ul>
                            {sanitizedIngredients.map((ingredient: Ingredient) => (
                                <li key={ingredient.name} className="ingredient-li">
                                    {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                                    {ingredient.details && (<span> - {ingredient.details}</span>)}
                                    <span> - </span>
                                    <EditRecipeIngredientButton id={ingredient.id}/>
                                    <span> - </span>
                                    <DeleteRecipeIngredientButton id={ingredient.id} recipeId={recipeId} name={ingredient.name} />
                                </li>
                            ))}
                        </ul>
                        <AddRecipeIngredientButton id={recipe.id} />
                    </div>
                    )}
                    <h3>Instructions: </h3>
                    <p dangerouslySetInnerHTML={{ __html: sanitizedInstructions }} />
                    <div className="flex w-[500px] justify-around align-center">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            Back
                        </Button>
                        <EditRecipeButton id={recipe.id} />
                        <DeleteRecipeButton id={recipe.id} title={recipe.title} />
                    </div>
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
            variant="outline"
        >
            <p>Edit Recipe</p>
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
            variant="outline"
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
            variant="outline"
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
        >
            {mutation.isPending ? "..." : <Trash className='h-4 w-4' />}
        </Button>
    );
}