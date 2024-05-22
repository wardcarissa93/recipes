import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/recipes')({
    component: Recipes
})

function Recipes() {
    return (
        <div className="p-2">
            <h3>Show all recipes</h3>
        </div>
    )
}