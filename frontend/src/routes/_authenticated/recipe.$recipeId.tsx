// import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';
import { 
    getRecipeByIdQueryOptions,
    getRecipeIngredientsByRecipeIdQueryOptions,
    // getIngredientById
 } from '@/lib/api';
import { Button } from '@/components/ui/button';

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
    console.log("recipe: ", recipe);
    const ingredients: Ingredient[] = ingredientsData?.recipeIngredients;
    console.log("ingredientsPending: ",ingredientsPending);
    console.log("ingredients: ", ingredients);

    // const [ingredientNames, setIngredientNames] = useState([]);
    
    // useEffect(() => {
    //     const fetchIngredientNames = async () => {
    //         if (ingredients) {
    //             const names = await Promise.all(
    //                 ingredients.map(async (ingredient) => {
    //                     const { ingredient: ingredientData } = await getIngredientById(ingredient.ingredientId);
    //                     return ingredientData.name;
    //                 })
    //             );
    //             console.log("names: ", names);
    //             setIngredientNames(names);
    //         }
    //     };
    //     fetchIngredientNames();
    // }, [ingredients]);

    // console.log("ingredientNames: ", ingredientNames);
    // console.log("ingredientNames[0]: ", ingredientNames[0]);

    if (recipeError) return 'An error has occurred: ' + recipeError.message;
    if (ingredientsError) return 'An error has occurred: ' + ingredientsError.message;

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
                            <ul>
                                {ingredients.map((ingredient: Ingredient) => (
                                    <li key={ingredient.name} className="ingredient-li">
                                        {ingredient.name} - {ingredient.quantity} {ingredient.unit}
                                        {ingredient.details && (<span> - {ingredient.details}</span>)}
                                        <span> - </span>
                                        <Link to="/edit-recipe-ingredient/$recipeIngredientId" params={{ recipeIngredientId: ingredient.id.toLocaleString() }}>
                                            Edit
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <h3>Instructions: </h3>
                    <p>{recipe.instructions}</p>
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}

export default RecipeDetails;
