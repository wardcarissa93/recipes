import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { useForm } from '@tanstack/react-form'
import {
    createRecipeIngredient,
    getAllIngredientsQueryOptions,
    getIngredientIdByName,
    getRecipeById,
    getRecipeIngredientsByRecipeIdQueryOptions,
    loadingCreateRecipeIngredientQueryOptions
} from '@/lib/api'
import Select from 'react-select'
import { sanitizeString } from '../../lib/utils'
import {
    type FetchedRecipe,
    type IngredientOption
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/add-recipe-ingredient/$recipeId')({
    component: AddRecipeIngredient
})

function AddRecipeIngredient() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { recipeId } = Route.useParams();

    const { data } = useQuery(getAllIngredientsQueryOptions);
    const ingredientList: string[] = data ? data.ingredients.map(ingredient => ingredient.name) : [];
    const ingredientOptions: IngredientOption[] = ingredientList.map((ingredient) => ({
        label: ingredient,
        value: ingredient,
    }));

    const [recipeTitle, setRecipeTitle] = useState('');

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const fetchedRecipe: FetchedRecipe = await getRecipeById(recipeId);
                setRecipeTitle(fetchedRecipe.recipe.title);
            } catch (error) {
                console.error("Error fetching recipe: ", error);
            }
        };
        fetchRecipe();
    }, [recipeId]);

    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            name: '',
            quantity: 0,
            unit: '',
            details: ''
        },
        onSubmit: async ({ value }) => {
            const existingIngredientsForRecipe = await queryClient.ensureQueryData(getRecipeIngredientsByRecipeIdQueryOptions(recipeId))
            const ingredientId = await getIngredientIdByName(value.name);
            const newRecipeIngredient = {
                ingredientId: ingredientId,
                recipeId: parseInt(recipeId),
                quantity: value.quantity,
                unit: sanitizeString(value.unit.trim()),
                details: value.details.trim() !== '' ? sanitizeString(value.details.trim()): null
            };

            queryClient.setQueryData(loadingCreateRecipeIngredientQueryOptions.queryKey, {
                recipeIngredient: newRecipeIngredient
            });

            try {
                const addedRecipeIngredient = await createRecipeIngredient({ value: newRecipeIngredient });
                queryClient.setQueryData(getRecipeIngredientsByRecipeIdQueryOptions(recipeId).queryKey, {
                    ...existingIngredientsForRecipe,
                    recipeIngredients: [...existingIngredientsForRecipe.recipeIngredients, addedRecipeIngredient]
                });
                await queryClient.invalidateQueries({ queryKey: getRecipeIngredientsByRecipeIdQueryOptions(recipeId).queryKey });
                toast("Ingredient Added", {
                    description: `Successfully added ${value.name} to '${recipeTitle}'`,
                });
                navigate({ to: `/recipe/${recipeId}` });
            } catch (error) {
                toast("Error", {
                    description: `Ingredient could not be added to recipe. ${error.message}`
                });
            } finally {
                queryClient.setQueryData(loadingCreateRecipeIngredientQueryOptions.queryKey, {});
            }
        },
    });

    return (
        <div className="p-2">
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <h2 className="text-center p-4 text-xl">Add Ingredient to {recipeTitle}</h2>
            <form
                className="max-w-xl m-auto"
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void form.handleSubmit()
                }}
            >
                <form.Field 
                    name="name"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Ingredient Name <span className="text-red-500 font-bold">*</span></Label>
                            <Select<IngredientOption>
                                        options={ingredientOptions}
                                        value={ingredientOptions.find(option => option.value === field.state.value)}
                                        onChange={(selectedOption) => {
                                            if (selectedOption) {
                                                field.handleChange(selectedOption.value);
                                            }
                                        }}
                                        placeholder="Select Ingredient"
                                        className="ingredient-name mt-2 text-sm"
                                    />
                            {field.state.meta.touchedErrors ? (
                                <em className="text-red-500">{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Field 
                    name="quantity"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Quantity <span className="text-red-500 font-bold">*</span></Label>
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
                                <em className="text-red-500">{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Field 
                    name="unit"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Unit <span className="text-red-500 font-bold">*</span></Label>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="mt-2"
                            />
                            {field.state.meta.touchedErrors ? (
                                <em className="text-red-500">{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Field 
                    name="details"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Details</Label>
                            <p className="italic text-xs">(eg. 'chopped', 'dried')</p>
                            <Input
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="mt-2"
                            />
                            {field.state.meta.touchedErrors ? (
                                <em className="text-red-500">{field.state.meta.touchedErrors}</em>
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