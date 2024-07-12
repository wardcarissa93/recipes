import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import {
    createIngredient,
    getAllIngredientsQueryOptions,
    loadingCreateIngredientQueryOptions
} from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createIngredientSchema } from '../../../../server/sharedTypes'
import { sanitizeString } from '../../lib/utils'

export const Route = createFileRoute('/_authenticated/create-ingredient')({
    component: CreateIngredient
})

function CreateIngredient() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            name: ''
        },
        onSubmit: async ({ value }) => {
            value.name = sanitizeString(value.name.trim().toLowerCase());
            const existingIngredients = await queryClient.ensureQueryData(
                getAllIngredientsQueryOptions
            );
            queryClient.setQueryData(loadingCreateIngredientQueryOptions.queryKey, {
                ingredient: value,
            });

            try {
                const newIngredient = await createIngredient({ value });
                queryClient.setQueryData(getAllIngredientsQueryOptions.queryKey, {
                    ...existingIngredients,
                    ingredients: [newIngredient, ...existingIngredients.ingredients],
                });
                toast("Ingredient Created", {
                    description: `Successfully created new ingredient: ${newIngredient.name}`,
                });
                navigate({ to: "/ingredients" });
            } catch (error) {
                if (error.message) {
                    toast("Error", {
                        description: error.message
                    })
                } else {
                    toast("Error", {
                        description: "Error creating ingredient.",
                    });
                }
            } finally {
                queryClient.setQueryData(loadingCreateIngredientQueryOptions.queryKey, {});
            }
        },
    });
    return (
        <div className="p-2">
            <h2 className="text-center p-4 text-xl">Create Ingredient</h2>
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
                        onChange: createIngredientSchema.shape.name
                    }}
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Ingredient Name <span className="text-yellow-300">*</span></Label>
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

export default CreateIngredient;
