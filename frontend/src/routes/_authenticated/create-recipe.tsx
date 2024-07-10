import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useForm } from '@tanstack/react-form';
import { 
    createRecipe,
    createRecipeIngredient,
    getIngredientIdByName,
    getAllRecipesQueryOptions,
    getAllIngredientsQueryOptions,
    loadingCreateRecipeQueryOptions
} from "@/lib/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { zodValidator } from '@tanstack/zod-form-adapter';
import { createRecipeSchema } from '../../../../server/sharedTypes';
import { sanitizeInput } from '../../utils/sanitizeInput';
import { useState } from 'react';
import Select from 'react-select';

type Ingredient = {
    name: string;
    quantity: number;
    unit: string;
    details: '';
};

type IngredientOption = {
    label: string;
    value: string;
};

export const Route = createFileRoute('/_authenticated/create-recipe')({
    component: CreateRecipe
});

function CreateRecipe() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: '', quantity: 0, unit: '', details: '' }]);

    const { data } = useQuery(getAllIngredientsQueryOptions);
    const ingredientList: string[] = data ? data.ingredients.map(ingredient => ingredient.name) : [];
    const ingredientOptions: IngredientOption[] = ingredientList.map((ingredient) => ({
        label: ingredient,
        value: ingredient,
    }));

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
            const existingRecipes = await queryClient.ensureQueryData(
                getAllRecipesQueryOptions
            );
            navigate({ to: "/my-recipes" });

            const recipe = {
                title: sanitizeInput(value.title.trim()),
                description: value.description.trim() !== '' ? sanitizeInput(value.description.trim()) : null,
                prepTime: value.prepTime !== 0 ? value.prepTime : null,
                cookTime: value.cookTime !== 0 ? value.cookTime : null,
                totalTime: value.totalTime,
                servings: value.servings !== 0 ? value.servings : null,
                instructions: sanitizeInput(value.instructions.trim()),
                url: value.url.trim() !== '' ? sanitizeInput(value.url.trim()) : null,
            };
            const ingredients = value.ingredients.map(ingredient => ({
                name: sanitizeInput(ingredient.name.trim()),
                quantity: ingredient.quantity,
                unit: sanitizeInput(ingredient.unit.trim()),
                details: ingredient.details.trim() !== '' ? sanitizeInput(ingredient.details.trim()) : null
            }));

            queryClient.setQueryData(loadingCreateRecipeQueryOptions.queryKey, { recipe: recipe });
            
            try {
                const newRecipe = await createRecipe({ value: recipe });
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
                });
            } catch (error) {
                toast("Error", {
                    description: `Failed to create new recipe`,
                });
            } finally {
                queryClient.setQueryData(loadingCreateRecipeQueryOptions.queryKey, {});
            }
        },
    });

    const addIngredient = () => {
        setIngredients([...ingredients, { name: '', quantity: 0, unit: '', details: '' }]);
    };

    const removeIngredient = (indexToRemove: number) => {
        const remainingIngredients = ingredients.filter((_, index) => index !== indexToRemove);
        setIngredients(remainingIngredients);
        form.setFieldValue('ingredients', remainingIngredients);
    };

    const handleIngredientChange = (index: number, field: string, value: any) => {
        const updatedIngredients = ingredients.map((ingredient, i) => 
            i === index ? { ...ingredient, [field]: value } : ingredient 
        );
        setIngredients(updatedIngredients);
        form.setFieldValue('ingredients', updatedIngredients);
    };

    return (
        <div className="p-1">
            <h2>Create Recipe</h2>
            <form 
                className='m-auto'
                onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void form.handleSubmit();
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
                            <textarea
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value)}
                                rows={5}
                                className="block w-full p-2 border rounded-md instructions-input"
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
                                <div className="flex-col">
                                    <Label htmlFor={field.name}>Ingredient Name</Label>
                                    <Select<IngredientOption>
                                        options={ingredientOptions}
                                        value={ingredientOptions.find(option => option.value === ingredient.name)}
                                        onChange={(selectedOption) => {
                                            if (selectedOption) {
                                                handleIngredientChange(index, 'name', selectedOption.value);
                                            }
                                        }}
                                        placeholder="Select Ingredient"
                                        className="ingredient-name"
                                    />
                                    {field.state.meta.touchedErrors ? (
                                        <em>{field.state.meta.touchedErrors}</em>
                                    ) : null}
                                </div>
                            ))}
                        />
                        <form.Field 
                            name={`ingredients[${index}].quantity`}
                            children={((field) => (
                                <div className="flex-col">
                                    <Label htmlFor={field.name}>Quantity</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={ingredient.quantity}
                                        onBlur={field.handleBlur}
                                        type="number"
                                        onChange={(e) => {
                                            field.handleChange(Number(e.target.value))
                                            handleIngredientChange(index, 'quantity', Number(e.target.value))
                                        }}
                                    />
                                    {field.state.meta.touchedErrors ? (
                                        <em>{field.state.meta.touchedErrors}</em>
                                    ) : null}
                                </div>
                            ))}
                        />
                        <form.Field 
                            name={`ingredients[${index}].unit`}
                            children={((field) => (
                                <div className="flex-col">
                                    <Label htmlFor={field.name}>Unit</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={ingredient.unit}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value)
                                            handleIngredientChange(index, 'unit', e.target.value)
                                        }}
                                    />
                                    {field.state.meta.touchedErrors ? (
                                        <em>{field.state.meta.touchedErrors}</em>
                                    ) : null}
                                </div>
                            ))}
                        />
                        <form.Field 
                            name={`ingredients[${index}].details`}
                            children={((field) => (
                                <div className="flex-col">
                                    <Label htmlFor={field.name}>Details</Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={ingredient.details}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value)
                                            handleIngredientChange(index, 'details', e.target.value)
                                        }}
                                    />
                                    {field.state.meta.touchedErrors ? (
                                        <em>{field.state.meta.touchedErrors}</em>
                                    ) : null}
                                </div>
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
                <Button type="button" onClick={addIngredient}>
                    Add Ingredient
                </Button>
                <Button type="submit">Create Recipe</Button>
            </form>
        </div>
    );
}

export default CreateRecipe;