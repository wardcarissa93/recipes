import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { createFileRoute, Link } from '@tanstack/react-router'
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
import { sanitizeString } from '../../lib/utils'
import { type Ingredient } from '../../lib/types'

export const Route = createFileRoute('/_authenticated/ingredients')({
    component: Ingredients
})

function Ingredients() {
    const { isPending, error, data } = useQuery(getAllIngredientsQueryOptions);
    const { data: loadingCreateIngredient } = useQuery(loadingCreateIngredientQueryOptions);
    const [isAscendingOrder, setIsAscendingOrder] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ingredientsPerPage = 8;

    if (error) return 'An error has occurred: ' + error.message

    const sanitizedIngredients = data?.ingredients.map((ingredient: Ingredient) => ({
        ...ingredient,
        name: sanitizeString(ingredient.name),
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

    const indexOfLastIngredient = currentPage * ingredientsPerPage;
    const indexOfFirstIngredient = indexOfLastIngredient - ingredientsPerPage;
    const currentIngredients = sortedIngredients.slice(indexOfFirstIngredient, indexOfLastIngredient);
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }

    return (
        <div className="p-2 max-w-xl m-auto">
            <div className='flex justify-between'>
                <Button onClick={toggleSortOrder}>
                    {isAscendingOrder ? 'Sort Ingredients Z-A' : 'Sort Ingredients A-Z'}
                </Button>
                <Link to="/create-ingredient" className="[&.active]:font-bold">
                    <Button>
                        Create Ingredient
                    </Button>
                </Link>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Ingredient</TableHead>
                        <TableHead className="w-1/6">Edit</TableHead>
                        <TableHead className="w-1/6">Delete</TableHead>
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
                    : currentIngredients.map((ingredient) => (
                        <TableRow key={ingredient.id}>
                            <TableCell>{ingredient.name}</TableCell>
                            <TableCell>
                                <IngredientEditButton id={ingredient.id}/>
                            </TableCell>
                            <TableCell>
                                <IngredientDeleteButton id={ingredient.id} name={ingredient.name}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-center mt-8">
                {Array.from({ length: Math.ceil(sortedIngredients.length / ingredientsPerPage) }, (_, index) => (
                    <Button key={index} onClick={() => paginate(index + 1)} className={`mx-1 ${currentPage === index + 1 ? 'bg-gray-300' : ''}`}>
                        {index + 1}
                    </Button>
                ))}
            </div>
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

function IngredientDeleteButton({ id, name }: { id: number, name: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteIngredient,
        onError: (error) => {
            console.error('Error deleting ingredient:', error);
            toast("Error", {
                description: error.message || `Failed to delete ingredient '${name}'`,
            });
        },
        onSuccess: () => {
            toast("Ingredient Deleted", {
                description: `Successfully deleted ingredient '${name}'`,
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
        mutation.mutate({ id });
    };

    return (
        <Button onClick={handleDelete}>
            {mutation.isPending ? "..." : <Trash className="h-4 w-4" />}
        </Button>
    )
}