import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/create-expense')({
    component: CreateExpense
})

function CreateExpense() {
    return (
        <div className="p-2">
            <h3>Create expense</h3>
        </div>
    )
}