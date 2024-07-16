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
import { sanitizeString } from '../../lib/utils';
import { useState } from 'react';
import Select from 'react-select';
import {
    type IngredientOption,
    type NewRecipeIngredient
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/create-recipe')({
    component: CreateRecipe
});

function CreateRecipe() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [ingredients, setIngredients] = useState<NewRecipeIngredient[]>([{ name: '', quantity: 0, unit: '', details: '' }]);

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
                title: sanitizeString(value.title.trim()),
                description: value.description.trim() !== '' ? sanitizeString(value.description.trim()) : null,
                prepTime: value.prepTime !== 0 ? value.prepTime : null,
                cookTime: value.cookTime !== 0 ? value.cookTime : null,
                totalTime: value.totalTime !== 0 ? value.totalTime : null,
                servings: value.servings !== 0 ? value.servings : null,
                instructions: sanitizeString(value.instructions.trim()),
                url: value.url.trim() !== '' ? sanitizeString(value.url.trim()) : null,
            };
            const ingredients = value.ingredients.map(ingredient => ({
                name: sanitizeString(ingredient.name.trim()),
                quantity: ingredient.quantity,
                unit: sanitizeString(ingredient.unit.trim()),
                details: ingredient.details.trim() !== '' ? sanitizeString(ingredient.details.trim()) : null
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
                    description: `Successfully created new recipe: ${newRecipe.title}`,
                });
            } catch (error) {
                toast("Error", {
                    description: `Failed to create new recipe. ${error.message}`,
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

    const handleIngredientChange = (index: number, field: string, value: unknown) => {
        const updatedIngredients = ingredients.map((ingredient, i) => 
            i === index ? { ...ingredient, [field]: value } : ingredient 
        );
        setIngredients(updatedIngredients);
        form.setFieldValue('ingredients', updatedIngredients);
    };

    return (
        <div className="p-2">
            <h2 className="text-center p-4 text-xl">Create Recipe</h2>
            <form 
                className='max-w-xl m-auto'
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
                    validators={({
                        onChange: createRecipeSchema.shape.description
                    })}
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
                        validators={({
                            onChange: createRecipeSchema.shape.prepTime
                        })}
                        children={((field) => (
                            <div className='my-2 w-1/2'>
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
                        validators={({
                            onChange: createRecipeSchema.shape.cookTime
                        })}
                        children={((field) => (
                            <div className='my-2 w-1/2'>
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
                        validators={({
                            onChange: createRecipeSchema.shape.totalTime
                        })}
                        children={((field) => (
                            <div className='my-2 w-1/2'>
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
                        validators={({
                            onChange: createRecipeSchema.shape.servings
                        })}
                        children={((field) => (
                            <div className='my-2 w-1/2'>
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
                    validators={({
                        onChange: createRecipeSchema.shape.instructions
                    })}
                    children={((field) => (
                        <div className='my-2'>
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
                    validators={({
                        onChange: createRecipeSchema.shape.url
                    })}
                    children={((field) => (
                        <div className='my-2'>
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
                <h2 className="text-center text-lg p-4">Ingredients</h2>
                {ingredients.map((ingredient, index) => (
                    <div key={index} className="ingredient-input">
                        <hr />
                        <div className="flex justify-between m-2 mb-4">
                            <h3 className="font-bold pb-6 pt-2">Ingredient {index+1}</h3>
                            {ingredients.length > 1 && (
                                <Button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        <form.Field 
                            name={`ingredients[${index}].name`}
                            children={((field) => (
                                <div className="flex justify-between m-2">
                                    <Label 
                                        htmlFor={field.name}
                                        className="w-1/2"
                                    >
                                        Ingredient Name <span className="text-yellow-300">*</span>
                                    </Label>
                                    <Select<IngredientOption>
                                        options={ingredientOptions}
                                        value={ingredientOptions.find(option => option.value === ingredient.name)}
                                        onChange={(selectedOption) => {
                                            if (selectedOption) {
                                                handleIngredientChange(index, 'name', selectedOption.value);
                                            }
                                        }}
                                        placeholder="Select Ingredient"
                                        className="ingredient-name w-1/2"
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
                                <div className="flex justify-between m-2">
                                    <Label 
                                        htmlFor={field.name}
                                        className="w-1/2"
                                    >
                                        Quantity <span className="text-yellow-300">*</span>
                                    </Label>
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
                                        className='w-1/2'
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
                                <div className="flex justify-between m-2">
                                    <Label 
                                        htmlFor={field.name}
                                        className="w-1/2"
                                    >
                                        Unit <span className="text-yellow-300">*</span>
                                    </Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={ingredient.unit}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value)
                                            handleIngredientChange(index, 'unit', e.target.value)
                                        }}
                                        className='w-1/2'
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
                                <div className="flex justify-between m-2">
                                    <Label 
                                        htmlFor={field.name}
                                        className='w-1/2'
                                    >
                                        Details
                                    </Label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={ingredient.details}
                                        onBlur={field.handleBlur}
                                        onChange={(e) => {
                                            field.handleChange(e.target.value)
                                            handleIngredientChange(index, 'details', e.target.value)
                                        }}
                                        className='w-1/2'
                                    />
                                    {field.state.meta.touchedErrors ? (
                                        <em>{field.state.meta.touchedErrors}</em>
                                    ) : null}
                                </div>
                            ))}
                        />
                    </div>
                ))}
                <div className="flex-col align-center">
                    <Button type="button" onClick={addIngredient} className="flex m-auto mb-8">
                        Add Another Ingredient
                    </Button>
                    <form.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button className="m-auto my-4 flex" type="submit" disabled={!canSubmit}>
                                {isSubmitting ? "..." : "Create Recipe"}
                            </Button>
                        )}
                    >
                    </form.Subscribe>
                </div>
            </form>
        </div>
    );
}

export default CreateRecipe;