import { useState, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { useForm } from '@tanstack/react-form'
import {
    createRecipeCategory,
    getAllCategoriesQueryOptions,
    getCategoryIdByName,
    getRecipeById,
    getRecipeCategoriesByRecipeIdQueryOptions,
    loadingCreateRecipeCategoryQueryOptions
} from '@/lib/api'
import Select from 'react-select'
import {
    type FetchedRecipe,
    type CategoryOption
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/add-recipe-category/$recipeId')({
    component: AddRecipeCategory
})

function AddRecipeCategory() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { recipeId } = Route.useParams();

    const { data } = useQuery(getAllCategoriesQueryOptions);
    const categoryList: string[] = data ? data.categories.map(category => category.categoryName) : [];
    const categoryOptions: CategoryOption[] = categoryList.map((category) => ({
        label: category,
        value: category,
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
            categoryName: ''
        },
        onSubmit: async ({ value }) => {
            const existingCategoriesForRecipe = await queryClient.ensureQueryData(getRecipeCategoriesByRecipeIdQueryOptions(recipeId))
            const categoryId = await getCategoryIdByName(value.categoryName);
            const newRecipeCategory = {
                categoryId: categoryId,
                recipeId: parseInt(recipeId)
            };

            queryClient.setQueryData(loadingCreateRecipeCategoryQueryOptions.queryKey, {
                recipeCategory: newRecipeCategory
            });

            try {
                const addedRecipeCategory = await createRecipeCategory({ value: newRecipeCategory });
                queryClient.setQueryData(getRecipeCategoriesByRecipeIdQueryOptions(recipeId).queryKey, {
                    ...existingCategoriesForRecipe,
                    recipeCategories: [...existingCategoriesForRecipe.recipeCategories, addedRecipeCategory]
                });
                await queryClient.invalidateQueries({ queryKey: getRecipeCategoriesByRecipeIdQueryOptions(recipeId).queryKey });
                toast("Category Added", {
                    description: `Successfully added ${recipeTitle} to '${value.categoryName}'`,
                });
                navigate({ to: `/recipe/${recipeId}` });
            } catch (error) {
                toast("Error", {
                    description: `Recipe could not be added to category. ${error.message}`
                });
            } finally {
                queryClient.setQueryData(loadingCreateRecipeCategoryQueryOptions.queryKey, {});
            }
        },
    });

    return (
        <div className="p-2">
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <h2 className="text-center p-4 text-xl">Add {recipeTitle} to Another Category</h2>
            <form
                className="max-w-xl m-auto"
                onSubmit={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    void form.handleSubmit()
                }}
            >
                <form.Field 
                    name="categoryName"
                    children={((field) => (
                        <div className="my-2">
                            <Label htmlFor={field.name}>Category Name <span className="text-red-500 font-bold">*</span></Label>
                            <Select<CategoryOption>
                                        options={categoryOptions}
                                        value={categoryOptions.find(option => option.value === field.state.value)}
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