import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useForm } from '@tanstack/react-form'
import { 
    createRecipe,
    createRecipeIngredient,
    getIngredientIdByName,
    getAllRecipesQueryOptions,
    getAllIngredientsQueryOptions,
    loadingCreateRecipeQueryOptions
} from "@/lib/api"
import { useQueryClient, useQuery } from "@tanstack/react-query"
import { zodValidator } from '@tanstack/zod-form-adapter'
import { createRecipeSchema } from '../../../../server/sharedTypes'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/create-recipe')({
    component: CreateRecipe
})

function CreateRecipe() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState([{ name: '', quantity: 0, unit: '', details: null }]);
    const [ingredientList, setIngredientList] = useState(['']);
    const { data } = useQuery(getAllIngredientsQueryOptions);


    useEffect(() => {
        if (data) {
            setIngredientList(data.ingredients.map(ingredient => ingredient.name));
        }
    }, [data]);

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
            url: '',
            ingredients: ingredients
        },
        onSubmit: async ({ value }) => {
            console.log("onSubmit value: ", value)
            const existingRecipes = await queryClient.ensureQueryData(
                getAllRecipesQueryOptions
            );
            navigate({ to: "/my-recipes" });

            const recipe = {
                title: value.title,
                description: value.description,
                prepTime: value.prepTime,
                cookTime: value.cookTime,
                totalTime: value.totalTime,
                servings: value.servings,
                instructions: value.instructions,
                url: value.url
            }
            const ingredients = value.ingredients.map(ingredient => ({
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                details: ingredient.details
            }));
            console.log("recipe: ", recipe)
            console.log("ingredients: ", ingredients)

            queryClient.setQueryData(loadingCreateRecipeQueryOptions.queryKey, { recipe: recipe });
            
            try {
                const newRecipe = await createRecipe({ value: recipe });
                // await createRecipeIngredient({ value: {
                //     quantity: ingredients[0].quantity,
                //     unit: ingredients[0].unit,
                //     ingredientId: ingredients[0].ingredientId,
                //     recipeId: newRecipe.id
                // } });
                const createdRecipeIngredients = [];
                for (const ingredient of ingredients) {
                    const ingredientId = await getIngredientIdByName(ingredient.name);
                    const newRecipeIngredient = await createRecipeIngredient({ value: {
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        details: ingredient.details,
                        ingredientId: ingredientId,
                        recipeId: newRecipe.id
                    } });
                    createdRecipeIngredients.push(newRecipeIngredient);
                }
                queryClient.setQueryData(getAllRecipesQueryOptions.queryKey, {
                    ...existingRecipes,
                    recipes: [newRecipe, ...existingRecipes.recipes],
                });
                toast("Recipe Created", {
                    description: `Successfully created new recipe: ${newRecipe.id}`,
                })
            } catch (error) {
                toast("Error", {
                    description: `Failed to create new recipe`,
                })
            } finally {
                queryClient.setQueryData(loadingCreateRecipeQueryOptions.queryKey, {});
            }
        },
    });

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: 0, unit: '', details: null }]);
    };

    const removeIngredient = (indexToRemove: number) => {
        console.log("index to remove: ", indexToRemove)
        setIngredients(ingredients.filter((_, index) => index !== indexToRemove))
    }

    return (
        <div className="p-2">
            <h2>Create Recipe</h2>
            <form 
                className='m-auto'
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
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-4 ingredient-input">
                        <form.Field 
                            name={`ingredients[${index}].name`}
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
                            name={`ingredients[${index}].quantity`}
                            children={((field) => (
                                <>
                                    <Label htmlFor={field.name}>Quantity</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value ?? ''}
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
                            name={`ingredients[${index}].unit`}
                            children={((field) => (
                                <>
                                    <Label htmlFor={field.name}>Unit</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value ?? ''}
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
                            name={`ingredients[${index}].details`}
                            children={((field) => (
                                <>
                                    <Label htmlFor={field.name}>Details</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value ?? ''}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                    />
                                    {field.state.meta.touchedErrors ? (
                                        <em>{field.state.meta.touchedErrors}</em>
                                    ) : null}
                                </>
                            ))}
                        />
                        {ingredients.length > 1 && (
                            <Button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="mb-4"
                            >
                                Remove
                            </Button>
                        )}
                    </div>
                ))}
                <Button id="add-ingredient-button" type="button" onClick={addIngredient} className="mb-4">
                    Add another ingredient
                </Button>
                <Button id="create-recipe-button" type="submit">Create</Button>
            </form>
        </div>
    )
}

export default CreateRecipe;