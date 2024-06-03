import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import { useQueryClient } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { editIngredientSchema } from '../../../../server/sharedTypes'
import { 
    editIngredient,
    getAllIngredientsQueryOptions,
    loadingEditIngredientQueryOptions 
} from '@/lib/api'

export const Route = createFileRoute('/_authenticated/edit-ingredient/$ingredientId')({
  component: EditIngredient
})

type UpdatedIngredient = {
    id: number,
    userId: string,
    name: string,
    createdAt: string | null
};

function EditIngredient() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { ingredientId } = Route.useParams();
    const id = ingredientId;
    console.log("ingredient id: ", id);
    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            name: ''
        },
        onSubmit: async ({ value }) => {
            value.name = value.name.trim().toLowerCase();
            console.log("value.name: ", value.name);
            const existingIngredients = await queryClient.ensureQueryData(getAllIngredientsQueryOptions);
            queryClient.setQueryData(loadingEditIngredientQueryOptions.queryKey, {
                ingredient: value,
            });

            try {
                const updatedIngredient: UpdatedIngredient = await editIngredient({ id, value });
                console.log("updatedIngredient: ", updatedIngredient);
                queryClient.setQueryData(getAllIngredientsQueryOptions.queryKey, {
                    ...existingIngredients,
                    ingredients: existingIngredients.ingredients.map(ingredient =>
                        ingredient.id === updatedIngredient.id ? updatedIngredient : ingredient
                    ),
                });
                await queryClient.invalidateQueries({ queryKey: getAllIngredientsQueryOptions.queryKey});
                toast("Ingredient Updated", {
                    description: `Successfully updated ingredient '${value.name}'`,
                });
                navigate({ to: "/ingredients" });
            } catch (error) {
                toast("Error", {
                    description: `Ingredient could not be updated.`
                });
            } finally {
                queryClient.setQueryData(loadingEditIngredientQueryOptions.queryKey, {});
            }
        },
    });
    return (
        <div className="p-2">
            <h2>Edit Ingredient</h2>
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
                            <>
                                <Label htmlFor={field.name}>Ingredient Name</Label>
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
