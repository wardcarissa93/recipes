// import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { 
    getRecipeByIdQueryOptions
 } from '@/lib/api';
// import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/_authenticated/recipe/$recipeId')({
    component: RecipeDetails
});

function RecipeDetails() {
    console.log(getRecipeByIdQueryOptions('1'));
    const { recipeId } = Route.useParams();
    const { isPending, error, data } = useQuery(getRecipeByIdQueryOptions(recipeId));
    console.log("id: ", recipeId);
    console.log("error: ", error);
    console.log("data: ", data);
    const recipe = data?.recipe;
    console.log("recipe: ", recipe);

    if (error) return 'An error has occurred: ' + error.message;
    // if (isPending) return <Skeleton className="h-6 w-48" />;

    // const recipe = data?.recipe;

    // return (
    //     <div className="p-2 max-w-3xl m-auto">
    //     </div>
    // )

    return (
        <div>
            {(!isPending) && (
                <div className="p-2 max-w-3xl m-auto">
                    <h1 className="text-2xl font-bold">{recipe.title}</h1>
                    <p>Servings: {recipe.servings}</p>
                    <p>Total Time: {recipe.totalTime}</p>
                    <p>Instructions: {recipe.instructions}</p>
                    <Button variant="outline" size="icon" onClick={() => window.history.back()}>
                        Back
                    </Button>
                </div>
            )}
        </div>
    );
}