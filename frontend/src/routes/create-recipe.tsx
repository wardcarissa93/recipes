import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/create-recipe')({
    component: CreateRecipe
})

function CreateRecipe() {
    return (
        <div className="p-2">
            <h3>Create recipe</h3>
        </div>
    )
}