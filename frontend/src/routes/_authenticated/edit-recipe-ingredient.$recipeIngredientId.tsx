import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { useForm } from '@tanstack/react-form'
import { 
    editRecipeIngredient,
    getAllIngredientsQueryOptions,
    getIngredientIdByName,
    getRecipeById,
    getRecipeIngredientById, 
    getRecipeIngredientsByRecipeIdQueryOptions,
    loadingEditRecipeIngredientQueryOptions
} from '@/lib/api'
import Select from 'react-select'
import { sanitizeString } from '../../lib/utils'
import {
    type ExistingRecipeIngredients,
    type FetchedRecipe,
    type FetchedRecipeIngredient,
    type IngredientOption,
    type RecipeIngredient
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/edit-recipe-ingredient/$recipeIngredientId')({
    component: EditRecipeIngredient
})

function EditRecipeIngredient() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { recipeIngredientId } = Route.useParams();
    const [oldRecipeIngredient, setOldRecipeIngredient] = useState({
        id: 0,
        ingredientId: 0,
        recipeId: 0,
        name: '',
        quantity: 0,
        unit: '',
        details: ''
    });

    const { data } = useQuery(getAllIngredientsQueryOptions);
    const ingredientList: string[] = data ? data.ingredients.map(ingredient => ingredient.name) : [];
    const ingredientOptions: IngredientOption[] = ingredientList.map((ingredient) => ({
        label: sanitizeString(ingredient),
        value: sanitizeString(ingredient),
    }));

    const [recipeTitle, setRecipeTitle] = useState('');

    useEffect(() => {
        const fetchRecipeIngredient = async () => {
            try {
                const fetchedRecipeIngredient: FetchedRecipeIngredient = await getRecipeIngredientById(recipeIngredientId);
                setOldRecipeIngredient({
                    id: fetchedRecipeIngredient.recipeIngredient.id,
                    ingredientId: fetchedRecipeIngredient.recipeIngredient.ingredientId,
                    recipeId: fetchedRecipeIngredient.recipeIngredient.recipeId,
                    name: sanitizeString(fetchedRecipeIngredient.recipeIngredient.name),
                    quantity: parseFloat(fetchedRecipeIngredient.recipeIngredient.quantity),
                    unit: sanitizeString(fetchedRecipeIngredient.recipeIngredient.unit),
                    details: fetchedRecipeIngredient.recipeIngredient.details !== (null || undefined) ? sanitizeString(fetchedRecipeIngredient.recipeIngredient.details) : ''
                });
            } catch (error) {
                console.error("Error fetching recipe's ingredient: ", error);
            }
        };

        fetchRecipeIngredient();
    }, [recipeIngredientId]);

    useEffect(() => {
        if (oldRecipeIngredient.recipeId) {
            const fetchRecipe = async () => {
                try {
                    const fetchedRecipe: FetchedRecipe = await getRecipeById(oldRecipeIngredient.recipeId.toString());
                    const sanitizedRecipeTitle = sanitizeString(fetchedRecipe.recipe.title);
                    setRecipeTitle(sanitizedRecipeTitle);
                } catch (error) {
                    console.error("Error fetching recipe: ", error);
                }
            };
            fetchRecipe();
        }
    }, [oldRecipeIngredient.recipeId])

    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            name: oldRecipeIngredient.name,
            quantity: oldRecipeIngredient.quantity,
            unit: oldRecipeIngredient.unit,
            details: oldRecipeIngredient.details
        },
        onSubmit: async ({ value }) => {
            const existingIngredientsForRecipe: ExistingRecipeIngredients = await queryClient.ensureQueryData(getRecipeIngredientsByRecipeIdQueryOptions(oldRecipeIngredient.recipeId.toString()));
            const ingredientId = await getIngredientIdByName(value.name);
            const recipeIngredientToEdit = {
                ingredientId: ingredientId,
                recipeId: oldRecipeIngredient.recipeId,
                quantity: value.quantity,
                unit: sanitizeString(value.unit.trim()),
                details: value.details.trim() !== '' ? sanitizeString(value.details.trim()) : null,
            };
            queryClient.setQueryData(loadingEditRecipeIngredientQueryOptions.queryKey, {
                recipeIngredient: recipeIngredientToEdit
            });
    
            try {
                const updatedRecipeIngredient: RecipeIngredient = await editRecipeIngredient({ id: oldRecipeIngredient.id.toString(), value: recipeIngredientToEdit });
                queryClient.setQueryData(getRecipeIngredientsByRecipeIdQueryOptions(oldRecipeIngredient.recipeId.toString()).queryKey, {
                    ...existingIngredientsForRecipe,
                    recipeIngredients: existingIngredientsForRecipe.recipeIngredients.map(recipeIngredient => recipeIngredient.id === updatedRecipeIngredient.id ? updatedRecipeIngredient : recipeIngredient)
                });
                await queryClient.invalidateQueries({ queryKey: getRecipeIngredientsByRecipeIdQueryOptions(oldRecipeIngredient.recipeId.toString()).queryKey });
                toast("Ingredient Updated", {
                    description: `Successfully updated ${value.name} for '${recipeTitle}'`,
                });
                navigate({ to: `/recipe/${oldRecipeIngredient.recipeId.toString()}` });
            } catch (error) {
                if (error.message) {
                    toast("Error", {
                        description: error.message
                    })
                } else {
                    toast("Error", {
                        description: `Ingredient could not be updated for recipe.`
                    });
                }
            } finally {
                queryClient.setQueryData(loadingEditRecipeIngredientQueryOptions.queryKey, {});
            }
        },
    });
    

    return (
        <div className="p-2">
            <h2 className="text-center p-4 text-xl">Edit '{oldRecipeIngredient.name}' for '{recipeTitle}'</h2>
            <form 
                className='max-w-xl m-auto'
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
                            <Label htmlFor={field.name}>Ingredient Name <span className="text-yellow-300">*</span></Label>
                            <Select<IngredientOption>
                                        options={ingredientOptions}
                                        value={ingredientOptions.find(option => option.value === field.state.value)}
                                        onChange={(selectedOption) => {
                                            if (selectedOption) {
                                                field.handleChange(selectedOption.value);
                                            }
                                        }}
                                        placeholder="Select Ingredient"
                                        className="ingredient-name mt-2"
                                    />
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </div>
                    ))}
                />
                <form.Field 
                    name="quantity"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Quantity <span className="text-yellow-300">*</span></Label>
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
                    name="unit"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Unit <span className="text-yellow-300">*</span></Label>
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
                    name="details"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Details</Label>
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