import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import DOMPurify from 'dompurify';
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
    const sanitizedTitle = recipe ? DOMPurify.sanitize(recipe.title) : '';

    let sanitizedInstructions = '';
    if (recipe) {
        const formattedInstructions = recipe.instructions.replace(/\n/g, '<br>');
        sanitizedInstructions = DOMPurify.sanitize(formattedInstructions);
    }

    const sanitizedIngredients = ingredientsData?.recipeIngredients.map((ingredient: Ingredient) => ({
        ...ingredient,
        name: DOMPurify.sanitize(ingredient.name),
        quantity: ingredient.quantity,
        unit: DOMPurify.sanitize(ingredient.unit),
        details: ingredient.details ? DOMPurify.sanitize(ingredient.details) : null
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
                                    <RecipeIngredientEditButton id={ingredient.id}/>
                                    <span> - </span>
                                    <RecipeIngredientDeleteButton id={ingredient.id} recipeId={recipeId} />
                                </li>
                            ))}
                        </ul>
                    </div>
                    )}
                    <h3>Instructions: </h3>
                    <p dangerouslySetInnerHTML={{ __html: sanitizedInstructions }} />
                    <div className="flex w-[500px] justify-around align-center">
                        <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                            Back
                        </Button>
                        <RecipeEditButton id={recipe.id} />
                        <RecipeDeleteButton id={recipe.id} />
                    </div>
                </div>
            )}
        </div>
    );
}

function RecipeEditButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const handleEdit = () => {
        navigate({
            to: `/edit-recipe/$recipeId`,
            params: { recipeId: id.toString() }
        });
    };

    return (
        <Button 
            onClick={handleEdit}
            variant="outline"
        >
            <p>Edit Recipe</p>
        </Button>
    )
}

function RecipeDeleteButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipe,
        onError: () => {
            toast("Error", {
                description: `Failed to delete recipe: ${id}`,
            });
        },
        onSuccess: () => {
            toast("Recipe Deleted", {
                description: `Successfully deleted recipe: ${id}`,
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

function RecipeIngredientEditButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const handleEdit = () => {
        navigate({
            to: "/edit-recipe-ingredient/$recipeIngredientId",
            params: { recipeIngredientId: id.toString() }
        });
    };

    return (
        <Button 
            onClick={handleEdit}
            variant="outline"
            size="icon"
        >
            <Edit className="h-4 w-4"/>
        </Button>
    )
}

function RecipeIngredientDeleteButton({ id, recipeId }: { id: number, recipeId: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipeIngredient,
        onError: () => {
            toast("Error", {
                description: `Failed to delete ingredient: ${id}`,
            });
        },
        onSuccess: () => {
            toast("Ingredient Deleted", {
                description: `Successfully deleted ingredient: ${id}`,
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