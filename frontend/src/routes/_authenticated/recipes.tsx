import { 
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/_authenticated/recipes')({
    component: Recipes
})

async function getAllRecipes() {
    const res = await api.recipes.$get()
    if (!res.ok) {
        throw new Error('server error')
    }
    const data = await res.json()
    return data
}

function Recipes() {
    const { isPending, error, data } = useQuery({
        queryKey: ['get-all-recipes'],
        queryFn: getAllRecipes
    })

    if (error) return 'An error has occurred: ' + error.message
    return (
        <div className="p-2 max-w-3xl m-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Servings</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isPending 
                    ? Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium"><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                        </TableRow>
                    )) 
                    : data?.recipes.map((recipe) => (
                        <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{recipe.id}</TableCell>
                            <TableCell>{recipe.title}</TableCell>
                            <TableCell>{recipe.servings}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}