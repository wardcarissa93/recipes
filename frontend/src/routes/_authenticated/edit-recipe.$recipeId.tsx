import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { editRecipeSchema } from '../../../../server/sharedTypes'
import {
    getAllRecipesQueryOptions,
    getRecipeById,
    getRecipeByIdQueryOptions,
    editRecipe,
    loadingEditRecipeQueryOptions
} from '@/lib/api'
 
export const Route = createFileRoute('/_authenticated/edit-recipe/$recipeId')({
    component: EditRecipe
})

function EditRecipe() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { recipeId } = Route.useParams();
    const [oldRecipe, setOldRecipe] = useState({
        title: '',
        description: '',
        prepTime: 0,
        cookTime: 0,
        totalTime: 0, 
        servings: 0, 
        instructions: '',
        url: ''
    });

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const fetchedRecipe = await getRecipeById(recipeId);
                setOldRecipe({
                    title: fetchedRecipe.recipe.title,
                    description: fetchedRecipe.recipe.description,
                    prepTime: parseInt(fetchedRecipe.recipe.prepTime),
                    cookTime: parseInt(fetchedRecipe.recipe.cookTime), 
                    totalTime: parseInt(fetchedRecipe.recipe.totalTime),
                    servings: parseInt(fetchedRecipe.recipe.servings),
                    instructions: fetchedRecipe.recipe.instructions,
                    url: fetchedRecipe.recipe.url
                });
            } catch (error) {
                console.error("Error fetching recipe: ", error);
            }
        };

        fetchRecipe();
    }, [recipeId]);

    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            title: oldRecipe.title,
            description: oldRecipe.description,
            prepTime: oldRecipe.prepTime,
            cookTime: oldRecipe.cookTime,
            totalTime: oldRecipe.totalTime,
            servings: oldRecipe.servings,
            instructions: oldRecipe.instructions,
            url: oldRecipe.url
        },
        onSubmit: async ({ value }) => {
            console.log("value being submitted: ", value)
            const existingRecipes = await queryClient.ensureQueryData(getAllRecipesQueryOptions);
            
            queryClient.setQueryData(loadingEditRecipeQueryOptions.queryKey, {
                recipe: value
            });

            try {
                const updatedRecipe = await editRecipe({ id: recipeId, value });
                queryClient.setQueryData(getAllRecipesQueryOptions.queryKey, {
                    ...existingRecipes,
                    recipes: existingRecipes.recipes.map(recipe => recipe.id === updatedRecipe.id ? updatedRecipe: recipe)
                });
                await queryClient.invalidateQueries({ queryKey: getAllRecipesQueryOptions.queryKey });
                toast("Recipe Updated", {
                    description: `Successfully updated recipe '${value.title}'`,
                });
                navigate({ to: "/my-recipes" });
            } catch (error) {
                toast("Error", {
                    description: `Recipe could not be updated.`
                });
            } finally {
                queryClient.setQueryData(loadingEditRecipeQueryOptions.queryKey, {});
            }
        },
    });

    const { isLoading } = useQuery(getRecipeByIdQueryOptions(recipeId));

    if (isLoading) return <div>Loading...</div>

    return (
        <div className="p-2">
            <h2>Edit Recipe '{oldRecipe.title}'</h2>
            <form
                className="max-w-xl m-auto"
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void form.handleSubmit()
                }}
            >
                <form.Field
                    name="title"
                    validators={{
                        onChange: editRecipeSchema.shape.title
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Title</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="description"
                    validators={{
                        onChange: editRecipeSchema.shape.description
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Description</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="prepTime"
                    validators={{
                        onChange: editRecipeSchema.shape.prepTime
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Prep Time</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                type="number"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="cookTime"
                    validators={{
                        onChange: editRecipeSchema.shape.cookTime
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Cook Time</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                type="number"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="totalTime"
                    validators={{
                        onChange: editRecipeSchema.shape.totalTime
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Total Time</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                type="number"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="servings"
                    validators={{
                        onChange: editRecipeSchema.shape.servings
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Servings</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                type="number"
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="instructions"
                    validators={{
                        onChange: editRecipeSchema.shape.instructions
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Instructions</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field
                    name="url"
                    validators={{
                        onChange: editRecipeSchema.shape.url
                    }}
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>URL</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button className="mt-4" type="submit" disabled={!canSubmit}>
                            {isSubmitting ? "..." : "Submit"}
                        </Button>
                    )}
                >
                </form.Subscribe>
            </form>
        </div>
    )
}