import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { editIngredientSchema } from '../../../../server/sharedTypes'
import { 
    editIngredient,
    getIngredientById,
    getAllIngredientsQueryOptions,
    getIngredientByIdQueryOptions,
    loadingEditIngredientQueryOptions 
} from '@/lib/api'
import { sanitizeString } from '../../lib/utils'
import {
    type FetchedIngredient,
    type Ingredient
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/edit-ingredient/$ingredientId')({
  component: EditIngredient
})

function EditIngredient() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { ingredientId } = Route.useParams();
    const id = ingredientId;

    const [ingredientName, setIngredientName] = useState('');
    useEffect(() => {
        const fetchIngredient = async () => {
            try {
                const fetchedIngredient: FetchedIngredient = await getIngredientById(id);
                const sanitizedIngredientName = sanitizeString(fetchedIngredient.ingredient.name);
                setIngredientName(sanitizedIngredientName);
            } catch (error) {
                console.error("Error fetching ingredient:", error);
            }
        };
    
        fetchIngredient();
    });

    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            name: ingredientName
        },
        onSubmit: async ({ value }) => {
            value.name = sanitizeString(value.name.trim().toLowerCase());
            const existingIngredients = await queryClient.ensureQueryData(getAllIngredientsQueryOptions);
            queryClient.setQueryData(loadingEditIngredientQueryOptions.queryKey, {
                ingredient: value,
            });

            try {
                const updatedIngredient: Ingredient = await editIngredient({ id, value });
                queryClient.setQueryData(getAllIngredientsQueryOptions.queryKey, {
                    ...existingIngredients,
                    ingredients: existingIngredients.ingredients.map(ingredient =>
                        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
                    ),
                });
                await queryClient.invalidateQueries({ queryKey: getAllIngredientsQueryOptions.queryKey});
                toast("Ingredient Updated", {
                    description: `Successfully updated ingredient: '${value.name}'`,
                });
                navigate({ to: "/ingredients" });
            } catch (error) {
                if (error.message) {
                    toast("Error", {
                        description: error.message
                    })
                } else {
                    toast("Error", {
                        description: `Ingredient could not be updated.`
                    });
                }
            } finally {
                queryClient.setQueryData(loadingEditIngredientQueryOptions.queryKey, {});
            }
        },
    });

    const { isLoading } = useQuery(getIngredientByIdQueryOptions(id));

    if (isLoading) return <div>Loading...</div>;
    
    return (
        <div className="p-2">
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <h2 className="text-center p-4 text-xl">Edit Ingredient '{ingredientName}'</h2>
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
                        validators={{
                            onChange: editIngredientSchema.shape.name
                        }}
                        children={((field) => (
                            <div className="my-2">
                                <Label htmlFor={field.name}>Ingredient Name</Label>
                                <p className="italic text-xs">Please use singular form only (no plurals) to prevent duplicates</p>
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
