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

type FetchedRecipeIngredient = {
    recipeIngredient: {
        id: number;
        ingredientId: number;
        recipeId: number;
        name: string;
        quantity: string;
        unit: string;
        details: string;
    }
}

type FetchedRecipe = {
    recipe: {
        id: number;
        title: string;
    }
}

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
    const [ingredientList, setIngredientList] = useState(['']);
    const { data } = useQuery(getAllIngredientsQueryOptions);
    const [recipeTitle, setRecipeTitle] = useState('');

    useEffect(() => {
        const fetchRecipeIngredient = async () => {
            try {
                const fetchedRecipeIngredient: FetchedRecipeIngredient = await getRecipeIngredientById(recipeIngredientId);
                console.log("fetchedRecipeIngredient: ", fetchedRecipeIngredient)
                setOldRecipeIngredient({
                    id: fetchedRecipeIngredient.recipeIngredient.id,
                    ingredientId: fetchedRecipeIngredient.recipeIngredient.ingredientId,
                    recipeId: fetchedRecipeIngredient.recipeIngredient.recipeId,
                    name: fetchedRecipeIngredient.recipeIngredient.name,
                    quantity: parseFloat(fetchedRecipeIngredient.recipeIngredient.quantity),
                    unit: fetchedRecipeIngredient.recipeIngredient.unit,
                    details: fetchedRecipeIngredient.recipeIngredient.details
                });
                if (oldRecipeIngredient.recipeId) {
                    const fetchedRecipe: FetchedRecipe = await getRecipeById(oldRecipeIngredient.recipeId.toString());
                    setRecipeTitle(fetchedRecipe.recipe.title);
                }
            } catch (error) {
                console.error("Error fetching recipe's ingredient: ", error);
            }
        };

        fetchRecipeIngredient();
        if (data) {
            setIngredientList(data.ingredients.map(ingredient => ingredient.name));
        }
    }, [recipeIngredientId, data, oldRecipeIngredient.recipeId]);

    console.log("oldRecipeIngredient: ", oldRecipeIngredient)

    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            name: oldRecipeIngredient.name,
            quantity: oldRecipeIngredient.quantity,
            unit: oldRecipeIngredient.unit,
            details: oldRecipeIngredient.details
        },
        onSubmit: async ({ value }) => {
            console.log("value being submitted: ", value)
            const existingIngredientsForRecipe = await queryClient.ensureQueryData(getRecipeIngredientsByRecipeIdQueryOptions(oldRecipeIngredient.recipeId.toString()));
            console.log("existing ingredients: ", existingIngredientsForRecipe)
            const ingredientId = await getIngredientIdByName(value.name);
            const recipeIngredientToEdit = {
                ingredientId: ingredientId,
                recipeId: oldRecipeIngredient.recipeId,
                quantity: value.quantity,
                unit: value.unit,
                details: value.details
            }
            queryClient.setQueryData(loadingEditRecipeIngredientQueryOptions.queryKey, {
                recipeIngredient: recipeIngredientToEdit
            });

            try {
                const updatedRecipeIngredient = await editRecipeIngredient({ id: oldRecipeIngredient.id.toString(), value: recipeIngredientToEdit });
                console.log("updatedRecipeIngredient: ", updatedRecipeIngredient)
                queryClient.setQueryData(getRecipeIngredientsByRecipeIdQueryOptions(oldRecipeIngredient.recipeId.toString()).queryKey, {
                    ...existingIngredientsForRecipe,
                    recipeIngredients: existingIngredientsForRecipe.recipeIngredients.map(recipeIngredient => recipeIngredient.id === updatedRecipeIngredient.id ? updatedRecipeIngredient: recipeIngredient)
                });
                await queryClient.invalidateQueries({ queryKey: getRecipeIngredientsByRecipeIdQueryOptions(oldRecipeIngredient.recipeId.toString()).queryKey });
                toast("Ingredient Updated", {
                    description: `Successfully updated ${oldRecipeIngredient.name} for recipe '${recipeTitle}'`,
                });
                navigate({ to: `/recipe/${oldRecipeIngredient.recipeId.toString()}` });
            } catch (error) {
                toast("Error", {
                    description: `Ingredient could not be updated for recipe.`
                });
            } finally {
                queryClient.setQueryData(loadingEditRecipeIngredientQueryOptions.queryKey, {});
            }
        },
    });

    return (
        <div className="p-2">
            <h2>Edit '{oldRecipeIngredient.name}' for Recipe '{recipeTitle}'</h2>
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
                        <>
                            <Label htmlFor={field.name}>Ingredient Name</Label>
                            <select
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="ingredient-name"
                            >
                                <option value="">Select Ingredient</option>
                                {ingredientList.map((ingredient, i) => (
                                    <option key={i} value={ingredient}>{ingredient}</option>
                                ))}
                            </select>
                            {field.state.meta.touchedErrors ? (
                                <em>{field.state.meta.touchedErrors}</em>
                            ) : null}
                        </>
                    ))}
                />
                <form.Field 
                    name="quantity"
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Quantity</Label>
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
                    name="unit"
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Unit</Label>
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
                    name="details"
                    children={((field) => (
                        <>
                            <Label htmlFor={field.name}>Details</Label>
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