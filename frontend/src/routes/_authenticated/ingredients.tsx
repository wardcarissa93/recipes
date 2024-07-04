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
import { useState } from 'react'
import {
    getAllIngredientsQueryOptions,
    loadingCreateIngredientQueryOptions,
    deleteIngredient
} from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Trash, Edit } from 'lucide-react'
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router'
import DOMPurify from 'dompurify';

export const Route = createFileRoute('/_authenticated/ingredients')({
    component: Ingredients
})

type Ingredient = {
    id: number,
    name: string,
}

function Ingredients() {
    const { isPending, error, data } = useQuery(getAllIngredientsQueryOptions);
    const { data: loadingCreateIngredient } = useQuery(loadingCreateIngredientQueryOptions);
    const [isAscendingOrder, setIsAscendingOrder] = useState(true);

    if (error) return 'An error has occurred: ' + error.message

    const sanitizedIngredients = data?.ingredients.map((ingredient: Ingredient) => ({
        ...ingredient,
        name: DOMPurify.sanitize(ingredient.name),
    })) || [];

    const toggleSortOrder = () => {
        setIsAscendingOrder(!isAscendingOrder);
    };

    const sortedIngredients = [...sanitizedIngredients].sort((a, b) => {
        if (isAscendingOrder) {
            return a.name.localeCompare(b.name);
        } else {
            return b.name.localeCompare(a.name);
        }
    });

    return (
        <div className="p-2 max-w-2xl m-auto">
            <Button onClick={toggleSortOrder}>
                {isAscendingOrder ? 'Sort Z-A' : 'Sort A-Z'}
            </Button>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingCreateIngredient?.ingredient && (
                        <TableRow>
                            <TableCell>{loadingCreateIngredient?.ingredient.name}</TableCell>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4"></Skeleton>
                            </TableCell>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4"></Skeleton>
                            </TableCell>
                        </TableRow>
                    )}
                    {isPending
                    ? Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                        </TableRow>
                    ))
                    : sortedIngredients?.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>
                                <IngredientEditButton id={ingredient.id}/>
                            </TableCell>
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

function IngredientEditButton({ id }: { id: number }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate({
            to: `/edit-ingredient/$ingredientId`,
            params: { ingredientId: id.toString() }
        });
    };

    return (
        <Button onClick={handleEdit}>
            <Edit className="h-4 w-4" />
        </Button>
    )
}

function IngredientDeleteButton({ id }: { id: number }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteIngredient,
        onError: (error) => {
            console.error('Error deleting ingredient:', error);
            toast("Error", {
                description: error.message || `Failed to delete ingredient: ${id}`,
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