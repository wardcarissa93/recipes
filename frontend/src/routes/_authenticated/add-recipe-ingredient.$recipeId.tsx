import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/add-recipe-ingredient/$recipeId')({
    component: AddRecipeIngredient
})

function AddRecipeIngredient() {
    return (
        <div className="p-2">

        </div>
    )
}