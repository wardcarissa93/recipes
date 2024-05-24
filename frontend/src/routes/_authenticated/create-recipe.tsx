import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { useForm } from '@tanstack/react-form'
import { 
    createRecipe,
    getAllRecipesQueryOptions,
    loadingCreateRecipeQueryOptions
} from "@/lib/api"
import { useQueryClient } from "@tanstack/react-query"
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createRecipeSchema } from '../../../../server/sharedTypes'

export const Route = createFileRoute('/_authenticated/create-recipe')({
    component: CreateRecipe
})

function CreateRecipe() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const form = useForm({
        validatorAdapter: zodValidator,
        defaultValues: {
            title: '',
            description: '',
            prepTime: 0,
            cookTime: 0,
            totalTime: 0,
            servings: 0,
            instructions: '',
            url: ''
        },
        onSubmit: async ({ value }) => {
            const existingRecipes = await queryClient.ensureQueryData(
                getAllRecipesQueryOptions
            );
            navigate({to: "/recipes"});

            queryClient.setQueryData(loadingCreateRecipeQueryOptions.queryKey, {
                recipe: value,
            });

            try {
                const newRecipe = await createRecipe({ value });
                queryClient.setQueryData(getAllRecipesQueryOptions.queryKey, {
                    ...existingRecipes,
                    recipes: [newRecipe, ...existingRecipes.recipes],
                });
                console.log("success")
            } catch (error) {
                console.log("error")
            } finally {
                queryClient.setQueryData(loadingCreateRecipeQueryOptions.queryKey, {});
            }
        },
    });
    return (
        <div className="p-2">
            <h2>Create Recipe</h2>
            <form 
                className='max-w-xl m-auto'
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void form.handleSubmit()
                }}
            >
                <form.Field 
                    name="title"
                    validators={{
                        onChange: createRecipeSchema.shape.title
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
                    validators={({
                        onChange: createRecipeSchema.shape.description
                    })}
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
                    validators={({
                        onChange: createRecipeSchema.shape.prepTime
                    })}
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
                    validators={({
                        onChange: createRecipeSchema.shape.cookTime
                    })}
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
                    validators={({
                        onChange: createRecipeSchema.shape.totalTime
                    })}
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
                    validators={({
                        onChange: createRecipeSchema.shape.servings
                    })}
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
                    validators={({
                        onChange: createRecipeSchema.shape.instructions
                    })}
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
                    validators={({
                        onChange: createRecipeSchema.shape.url
                    })}
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