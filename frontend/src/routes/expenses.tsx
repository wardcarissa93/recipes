import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/expenses')({
    component: Expenses
})

function Expenses() {
    return (
        <div className="p-2">
            <h3>Show all expenses</h3>
        </div>
    )
}