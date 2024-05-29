// import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { 
    getRecipeByIdQueryOptions,
    getRecipeIngredientsByRecipeIdQueryOptions
 } from '@/lib/api';
// import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/recipe/$recipeId')({
    component: RecipeDetails
});

function RecipeDetails() {
    const { recipeId } = Route.useParams();

    const { isPending: recipePending, error: recipeError, data: recipeData } = useQuery(getRecipeByIdQueryOptions(recipeId));
    const { isPending: ingredientsPending, error: ingredientsError, data: ingredientsData } = useQuery(getRecipeIngredientsByRecipeIdQueryOptions(recipeId));

    if (recipeError) return 'An error has occurred: ' + recipeError.message;
    if (ingredientsError) return 'An error has occurred: ' + ingredientsError.message;

    const recipe = recipeData?.recipe;
    console.log("recipe: ", recipe);
    const ingredients = ingredientsData?.recipeIngredients;
    console.log("ingredients: ", ingredients);

    // if (isPending) return <Skeleton className="h-6 w-48" />;

    // const recipe = data?.recipe;

    // return (
    //     <div className="p-2 max-w-3xl m-auto">
    //     </div>
    // )

    return (
        <div>
            {(!recipePending) && (
                <div className="p-2 max-w-3xl m-auto">
                    <h1 className="text-2xl font-bold">{recipe.title}</h1>
                    <p>Servings: {recipe.servings}</p>
                    <p>Total Time: {recipe.totalTime}</p>
                    {(!ingredientsPending) && (
                        <div>
                            <h3>Ingredients:</h3>

                        </div>
                    )}
                    <p>Instructions: {recipe.instructions}</p>
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}