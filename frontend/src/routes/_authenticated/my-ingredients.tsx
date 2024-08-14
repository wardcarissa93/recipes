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
import { useState, useEffect } from 'react'
import {
    getAllIngredientsQueryOptions,
    loadingCreateIngredientQueryOptions,
    deleteIngredient
} from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash, Edit } from 'lucide-react'
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router'
import { sanitizeString } from '../../lib/utils'
import { type Ingredient } from '../../lib/types'

export const Route = createFileRoute('/_authenticated/my-ingredients')({
    component: Ingredients
})

function Ingredients() {
    const { isPending, error, data } = useQuery(getAllIngredientsQueryOptions);
    const { data: loadingCreateIngredient } = useQuery(loadingCreateIngredientQueryOptions);
    const [currentPage, setCurrentPage] = useState(1);
    const [filterText, setFilterText] = useState('');
    const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
    const ingredientsPerPage = 8;

    useEffect(() => {
        const sanitizedIngredients = data?.ingredients.map((ingredient: Ingredient) => ({
            ...ingredient,
            name: sanitizeString(ingredient.name),
        })) || [];
        const filtered = sanitizedIngredients.filter(ingredient => ingredient.name.includes(filterText.toLowerCase()));
        setFilteredIngredients(filtered);
        setCurrentPage(1);
    }, [filterText, data?.ingredients])

    if (error) return 'An error has occurred: ' + error.message

    const indexOfLastIngredient = currentPage * ingredientsPerPage;
    const indexOfFirstIngredient = indexOfLastIngredient - ingredientsPerPage;
    const currentIngredients = filteredIngredients.slice(indexOfFirstIngredient, indexOfLastIngredient);
    const totalPages = Math.ceil(filteredIngredients.length / ingredientsPerPage);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }

    // Function to render pagination buttons
    const renderPagination = () => {
        const pageNumbers = [];
        let ellipsisLeft = false;
        let ellipsisRight = false;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                pageNumbers.push(i);
            } else if (i < currentPage - 1 && !ellipsisLeft) {
                pageNumbers.push('left-ellipsis');
                ellipsisLeft = true;
            } else if (i > currentPage + 1 && !ellipsisRight) {
                pageNumbers.push('right-ellipsis');
                ellipsisRight = true;
            }
        }

        return pageNumbers.map((number, index) =>
            typeof number === 'number' ? (
                <Button
                    key={index}
                    onClick={() => paginate(number)}
                    className={`mx-1 ${currentPage === number ? 'bg-gray-300' : ''}`}
                >
                    {number}
                </Button>
            ) : (
                <Button
                    key={index}
                    onClick={() => handleEllipsisClick(number === 'left-ellipsis' ? 'left' : 'right')}
                    className="mx-1"
                >
                    ...
                </Button>
            )
        );
    };

    const handleEllipsisClick = (direction: 'left' | 'right') => {
        if (direction === 'left') {
            setCurrentPage(prevPage => Math.max(prevPage - 3, 1));
        } else {
            setCurrentPage(prevPage => Math.min(prevPage + 3, totalPages));
        }
    };

    return (
        <div className="p-2 max-w-xl m-auto">
            <div className='flex justify-between gap-8 mb-4'>
                <Link to="/create-ingredient" className="[&.active]:font-bold">
                    <Button className="w-[140px]">
                        Create Ingredient
                    </Button>
                </Link>
                <Input 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Search for ingredient by name"
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Ingredient</TableHead>
                        <TableHead className="w-1/6"><p className="px-2">Edit</p></TableHead>
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
                    : (
                        (currentIngredients.length === 0) ? 
                            <p className="p-4 mt-2">
                                No ingredients found.
                            </p>
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
                        ))
                    )}
                </TableBody>
            </Table>
            <div className="flex justify-center mt-8">
                    {renderPagination()}
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
        <Button
            onClick={handleEdit} 
            variant="outline"
            size="icon"
        >
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
        <Button
            onClick={handleDelete} 
            variant="outline"
            size="icon"
            className="hover:bg-red-500"
        >
            {mutation.isPending ? "..." : <Trash className="h-4 w-4" />}
        </Button>
    )
}