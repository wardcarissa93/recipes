import { 
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

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