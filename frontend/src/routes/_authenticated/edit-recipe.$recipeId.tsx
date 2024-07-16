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
import { sanitizeString } from '../../lib/utils'
import {
    type FetchedRecipe,
    type Recipe
} from '../../lib/types'
 
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
                const fetchedRecipe: FetchedRecipe = await getRecipeById(recipeId);
                setOldRecipe({
                    title: sanitizeString(fetchedRecipe.recipe.title),
                    description: fetchedRecipe.recipe.description !== (null || undefined) ? sanitizeString(fetchedRecipe.recipe.description) : '',
                    prepTime: fetchedRecipe.recipe.prepTime ? parseInt(fetchedRecipe.recipe.prepTime) : 0,
                    cookTime: fetchedRecipe.recipe.cookTime ? parseInt(fetchedRecipe.recipe.cookTime) : 0, 
                    totalTime: fetchedRecipe.recipe.totalTime ? parseInt(fetchedRecipe.recipe.totalTime) : 0,
                    servings: fetchedRecipe.recipe.servings ? parseInt(fetchedRecipe.recipe.servings) : 0,
                    instructions: fetchedRecipe.recipe.instructions !== (null || undefined) ? sanitizeString(fetchedRecipe.recipe.instructions) : '',
                    url: fetchedRecipe.recipe.url !== (null || undefined) ? sanitizeString(fetchedRecipe.recipe.url) : ''
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
            const existingRecipes = await queryClient.ensureQueryData(getAllRecipesQueryOptions);
            navigate({ to: "/my-recipes" });
            queryClient.setQueryData(loadingEditRecipeQueryOptions.queryKey, {
                recipe: value
            });

            try {
                const sanitizedValue = {
                    ...value,
                    title: sanitizeString(value.title.trim()),
                    description: value.description.trim() !== '' ? sanitizeString(value.description) : null,
                    prepTime: value.prepTime !== 0 ? value.prepTime : null,
                    cookTime: value.cookTime !== 0 ? value.cookTime : null,
                    totalTime: value.totalTime !== 0 ? value.totalTime : null,
                    servings: value.servings !== 0 ? value.servings : null,
                    instructions: sanitizeString(value.instructions.trim()),
                    url: value.url.trim() !== '' ? sanitizeString(value.url) : null,
                };

                const updatedRecipe: Recipe = await editRecipe({ id: recipeId, value: sanitizedValue });
                queryClient.setQueryData(getAllRecipesQueryOptions.queryKey, {
                    ...existingRecipes,
                    recipes: existingRecipes.recipes.map(recipe => recipe.id === updatedRecipe.id ? updatedRecipe: recipe)
                });
                await queryClient.invalidateQueries({ queryKey: getAllRecipesQueryOptions.queryKey });
                await queryClient.invalidateQueries({ queryKey: getRecipeByIdQueryOptions(recipeId).queryKey });
                toast("Recipe Updated", {
                    description: `Successfully updated recipe '${value.title}'`,
                });

            } catch (error) {
                console.error(error)
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
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <h2 className="text-center p-4 text-xl">Edit Recipe '{oldRecipe.title}'</h2>
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
                        <div className="my-2">
                            <Label htmlFor={field.name}>Title <span className="text-yellow-300">*</span></Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="mt-2"
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Field
                    name="description"
                    validators={{
                        onChange: editRecipeSchema.shape.description
                    }}
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Description</Label>
                            <textarea 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                rows={3}
                                className="mt-2 block w-full p-2 border rounded-md description-input"
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <div className="flex gap-8">
                    <form.Field
                        name="prepTime"
                        validators={{
                            onChange: editRecipeSchema.shape.prepTime
                        }}
                        children={((field) => (
                            <div className="my-2 w-1/2">
                                <Label htmlFor={field.name}>Prep Time (in minutes)</Label>
                                <p className="italic text-xs">(Enter 0 if unavailable)</p>
                                <Input 
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    type="number"
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="mt-2"
                                />
                                {field.state.meta.touchedErrors ? (
                                    <em>{field.state.meta.touchedErrors}</em>
                                ) : null}
                            </div>
                        ))}
                    />
                    <form.Field
                        name="cookTime"
                        validators={{
                            onChange: editRecipeSchema.shape.cookTime
                        }}
                        children={((field) => (
                            <div className="my-2 w-1/2">
                                <Label htmlFor={field.name}>Cook Time (in minutes)</Label>
                                <p className="italic text-xs">(Enter 0 if unavailable)</p>
                                <Input 
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    type="number"
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="mt-2"
                                />
                                {field.state.meta.touchedErrors ? (
                                    <em>{field.state.meta.touchedErrors}</em>
                                ) : null}
                            </div>
                        ))}
                    />
                </div>
                <div className="flex gap-8">
                    <form.Field
                        name="totalTime"
                        validators={{
                            onChange: editRecipeSchema.shape.totalTime
                        }}
                        children={((field) => (
                            <div className="my-2 w-1/2">
                                <Label htmlFor={field.name}>Total Time (in minutes)</Label>
                                <p className="italic text-xs">(Enter 0 if unavailable)</p>
                                <Input 
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    type="number"
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="mt-2"
                                />
                                {field.state.meta.touchedErrors ? (
                                    <em>{field.state.meta.touchedErrors}</em>
                                ) : null}
                            </div>
                        ))}
                    />
                    <form.Field
                        name="servings"
                        validators={{
                            onChange: editRecipeSchema.shape.servings
                        }}
                        children={((field) => (
                            <div className="my-2 w-1/2">
                                <Label htmlFor={field.name}>Servings</Label>
                                <p className="italic text-xs">(Enter 0 if unavailable)</p>
                                <Input 
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    type="number"
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="mt-2"
                                />
                                {field.state.meta.touchedErrors ? (
                                    <em>{field.state.meta.touchedErrors}</em>
                                ) : null}
                            </div>
                        ))}
                    />
                </div>

                <form.Field
                    name="instructions"
                    validators={{
                        onChange: editRecipeSchema.shape.instructions
                    }}
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Instructions <span className="text-yellow-300">*</span></Label>
                            <textarea 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                rows={5}
                                className="block w-full p-2 border rounded-md instructions-input mt-2"
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Field
                    name="url"
                    validators={{
                        onChange: editRecipeSchema.shape.url
                    }}
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>URL</Label>
                            <Input 
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="mt-2"
                            />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button className="mt-8 mx-auto flex" type="submit" disabled={!canSubmit}>
                            {isSubmitting ? "..." : "Submit"}
                        </Button>
                    )}
                >
                </form.Subscribe>
            </form>
        </div>
    )
}