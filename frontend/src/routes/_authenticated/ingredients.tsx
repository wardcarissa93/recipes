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
import {
    getAllIngredientsQueryOptions,
    loadingCreateIngredientQueryOptions,
    deleteIngredient
} from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/ingredients')({
    component: Ingredients
})

function Ingredients() {
    const { isPending, error, data } = useQuery(getAllIngredientsQueryOptions);
    const { data: loadingCreateIngredient } = useQuery(loadingCreateIngredientQueryOptions);
    if (error) return 'An error has occurred: ' + error.message
    return (
        <div className="p-2 max-w-3xl m-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingCreateIngredient?.ingredient && (
                        <TableRow>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4"></Skeleton>
                            </TableCell>
                            <TableCell>{loadingCreateIngredient?.ingredient.name}</TableCell>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4"></Skeleton>
                            </TableCell>
                        </TableRow>
                    )}
                    {isPending
                    ? Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell className="font-medium"><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                        </TableRow>
                    ))
                    : data?.ingredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">{ingredient.id}</TableCell>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>
                                <IngredientDeleteButton id={ingredient.id}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function IngredientDeleteButton({ id }: { id: number }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteIngredient,
        onError: (error) => {
            console.error('Error deleting ingredient:', error);
            toast("Error", {
                description: `Failed to delete ingredient: ${id}`,
            });
        },
        onSuccess: () => {
            console.log('Ingredient deleted successfully:', id);
            toast("Ingredient Deleted", {
                description: `Successfully deleted ingredient: ${id}`,
            })
            queryClient.setQueryData(
                getAllIngredientsQueryOptions.queryKey,
                (existingIngredients) => ({
                    ...existingIngredients,
                    ingredients: existingIngredients!.ingredients.filter((e) => e.id !== id),
                })
            );
        },
    });

    const handleDelete = () => {
        console.log('Deleting ingredient with id:', id);
        mutation.mutate({ id });
    };

    return (
        <Button onClick={handleDelete}>
            {mutation.isPending ? "..." : <Trash className="h-4 w-4" />}
        </Button>
    )
}
