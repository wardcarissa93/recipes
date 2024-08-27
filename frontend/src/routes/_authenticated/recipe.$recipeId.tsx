import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { sanitizeString, formatTime } from '../../lib/utils'
import { 
    deleteRecipeCategory,
    getRecipeByIdQueryOptions,
    getRecipeIngredientsByRecipeIdQueryOptions,
    getRecipeCategoriesByRecipeIdQueryOptions
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

type Category = {
    id: number,
    categoryName: string
}

export const Route = createFileRoute('/_authenticated/recipe/$recipeId')({
    component: RecipeDetails
});

function RecipeDetails() {
    const navigate = useNavigate();
    const { recipeId } = Route.useParams();

    const { isPending: recipePending, error: recipeError, data: recipeData } = useQuery(getRecipeByIdQueryOptions(recipeId));
    const { isPending: ingredientsPending, error: ingredientsError, data: ingredientsData } = useQuery(getRecipeIngredientsByRecipeIdQueryOptions(recipeId));
    const { isPending: categoriesPending, error: categoriesError, data: categoriesData } = useQuery(getRecipeCategoriesByRecipeIdQueryOptions(recipeId));

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
        const formattedInstructions = recipe.instructions.replace(/\n/g, '<br><span></span>');
        sanitizedInstructions = sanitizeString(formattedInstructions);
        if (recipe.url) {
            sanitizedUrl = sanitizeString(recipe.url);
        }
    }

    const [leftColumnIngredients, setLeftColumnIngredients] = useState<Ingredient[]>([]);
    const [rightColumnIngredients, setRightColumnIngredients] = useState<Ingredient[]>([]);

    useEffect(() => {
        if (ingredientsData?.recipeIngredients) {
            const sanitizedIngredients = ingredientsData.recipeIngredients
                .map((ingredient: Ingredient) => ({
                    ...ingredient, 
                    name: sanitizeString(ingredient.name),
                    quantity: ingredient.quantity,
                    unit: sanitizeString(ingredient.unit),
                    details: ingredient.details ? sanitizeString(ingredient.details) : null
                }))
                .sort((a: Ingredient, b: Ingredient) => a.id - b.id);
            const midIndex = Math.ceil(sanitizedIngredients.length / 2);
            setLeftColumnIngredients(sanitizedIngredients.slice(0, midIndex));
            setRightColumnIngredients(sanitizedIngredients.slice(midIndex));
        }
    }, [ingredientsData]);

    const sanitizedCategories = categoriesData?.recipeCategories
        .map((category: Category) => ({
            ...category,
            categoryName: sanitizeString(category.categoryName)
        }))
        .sort((a: Category, b: Category) => a.categoryName.localeCompare(b.categoryName));

    if (recipeError) return 'An error has occurred: ' + recipeError.message;
    if (ingredientsError) return 'An error has occurred: ' + ingredientsError.message;
    if (categoriesError) return 'An error has occurred: ' + categoriesError.message;

    return (
        <div>
            {(!recipePending) && (
                <div className="p-2 max-w-3xl m-auto">
                    <Button onClick={() => navigate({ to: '/my-recipes' })}>
                        Back
                    </Button>
                    {(categoriesPending) ? (
                        <div>
                            <p>Categories loading...</p>
                        </div>
                    ) : (
                        <div className="flex justify-between">
                            <div className="flex mb-2 mt-4 gap-4 max-w-lg">
                                <p className="text-bold mt-2">Category(ies): </p>
                                {(sanitizedCategories.length > 0) ? (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {sanitizedCategories.map((category) => (
                                            <div key={category.categoryName} className="flex items-center">
                                                <DeleteRecipeCategoryButton id={category.id} recipeId={recipeId} categoryName={category.categoryName} />
                                                <p className="ml-2 max-w-[250px]">
                                                    {category.categoryName}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="mt-2">None</p>
                                )}
                            </div>
                            <AddRecipeCategoryButton id={recipe.id} />
                        </div>
                    )}
                    <div className="text-center p-4 mt-8">
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
                        <p>Prep Time: {recipe.prepTime ? (formatTime(recipe.prepTime)) : "N/A"}</p>
                        <p>Cook Time: {recipe.cookTime ? (formatTime(recipe.cookTime)) : "N/A"}</p>
                        <p>Total Time: {recipe.totalTime ? (formatTime(recipe.totalTime)) : "N/A"}</p>
                    </div>
                    {(ingredientsPending) ? (
                        <div>
                            <p>Ingredients loading...</p>
                        </div>
                    ) : (
                        <div className="my-8">
                            <hr />
                            <h3 className="text-center p-2 my-4 text-lg font-bold">Ingredients</h3>
                            <div className="flex justify-center gap-8 mb-4">
                                <div>
                                    {leftColumnIngredients.map((ingredient: Ingredient) => (
                                        <div key={ingredient.id} className="flex items-center mb-2">
                                            <EditRecipeIngredientButton id={ingredient.id}/>
                                            <DeleteRecipeIngredientButton id={ingredient.id}/>
                                            <p className="ml-2">
                                                {(ingredient.quantity > 0) && ingredient.quantity} {(ingredient.unit !== "individual") && ingredient.unit} {ingredient.name}
                                                {ingredient.details && (<span>, {ingredient.details}</span>)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    {rightColumnIngredients.map((ingredient: Ingredient) => (
                                        <div key={ingredient.id} className="flex items-center mb-2">
                                            <EditRecipeIngredientButton id={ingredient.id}/>
                                            <DeleteRecipeIngredientButton id={ingredient.id}/>
                                            <p className="ml-2 max-w-[250px]">
                                                {(ingredient.quantity > 0) && ingredient.quantity} {(ingredient.unit !== "individual") && ingredient.unit} {ingredient.name}
                                                {ingredient.details && (<span>, {ingredient.details}</span>)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <hr />
                        </div>
                    )}
                    <h3 className="text-center mb-4 text-lg font-bold">Instructions</h3>
                    <p dangerouslySetInnerHTML={{ __html: sanitizedInstructions }} className="p-2 max-w-xl m-auto recipe-instructions"/>
                    <div className="flex justify-between my-8">
                        <EditRecipeButton id={recipe.id} />
                        <AddRecipeIngredientButton id={recipe.id}/>
                        <DeleteRecipeButton id={recipe.id}/>
                    </div>
                    <Button onClick={() => window.history.back()} className="mx-auto my-16 flex">
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

function DeleteRecipeButton({ id }: { id: number }) {
    const navigate = useNavigate();
    
    const confirmDelete = () => {
        navigate({
            to: `/delete-recipe/$recipeId`,
            params: { recipeId: id.toString() }
        })
    }

    return (
        <Button
            onClick={confirmDelete}
            className="w-[150px] hover:bg-red-500"
        >
            Delete Recipe
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
            className="border-indigo-400 mr-2 min-h-[40px] min-w-[40px]"
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

function AddRecipeCategoryButton({ id }: { id: number}) {
    const navigate = useNavigate();
    const navigateToAddRecipeCategory = () => {
        navigate({
            to: "/add-recipe-category/$recipeId",
            params: { recipeId: id.toString() }
        });
    };

    return (
        <Button
            onClick={navigateToAddRecipeCategory}
            className="mt-4"
        >
            Add Recipe to Another Category
        </Button>
    )
}

function DeleteRecipeIngredientButton({ id }) {
    const navigate = useNavigate();

    const confirmDelete = () => {
        navigate({
            to: `/delete-recipe-ingredient/$recipeIngredientId`,
            params: { recipeIngredientId: id.toString() }
        });
    };

    return (
        <Button
            onClick={confirmDelete}
            variant="outline"
            size="icon"
            className="hover:bg-red-500 border-red-500 min-h-[40px] min-w-[40px]"
        >
            <Trash className='h-4 w-4' />
        </Button>
    );
}

function DeleteRecipeCategoryButton({ id, recipeId, categoryName }: { id: number, recipeId: string, categoryName: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipeCategory,
        onError: (error) => {
            console.error('Error deleting category:', error);
            toast("Error", {
                description: error.message || `Failed to delete category: ${categoryName}`,
            });
        },
        onSuccess: () => {
            toast("Category Deleted", {
                description: `Successfully deleted category: ${categoryName}`,
            })
            queryClient.setQueryData(
                getRecipeCategoriesByRecipeIdQueryOptions(recipeId).queryKey,
                (existingRecipeCategories) => ({
                    ...existingRecipeCategories,
                    recipeCategories: existingRecipeCategories!.recipeCategories.filter((e) => e.id !== id),
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
            className="hover:bg-red-500 border-red-500 min-h-[40px] min-w-[40px]"
        >
            {mutation.isPending ? "..." : <Trash className='h-4 w-4' />}
        </Button>
    );
}