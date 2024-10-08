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
    loadingCreateIngredientQueryOptions
} from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash, Edit } from 'lucide-react'
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
        const sanitizedIngredients = data?.ingredients
            .map((ingredient: Ingredient) => ({
                ...ingredient,
                name: sanitizeString(ingredient.name),
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
            || [];
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
                    className={`mx-1 ${currentPage === number ? 'bg-gray-300 text-gray-600 hover:bg-gray-300' : ''}`}
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
                    placeholder="Search for ingredient by name..."
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
                                    <EditIngredientButton id={ingredient.id}/>
                                </TableCell>
                                <TableCell>
                                    <DeleteIngredientButton id={ingredient.id}/>
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

function EditIngredientButton({ id }: { id: number }) {
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
            className="border-indigo-400"
        >
            <Edit className="h-4 w-4" />
        </Button>
    )
}

function DeleteIngredientButton({ id }: { id: number }) {
    const navigate = useNavigate();

    const confirmDelete = () => {
        navigate({
            to: `/delete-ingredient/$ingredientId`,
            params: { ingredientId: id.toString() }
        });
    };

    return (
        <Button
            onClick={confirmDelete} 
            variant="outline"
            size="icon"
            className="border-red-500 hover:bg-red-500"
        >
            <Trash className="h-4 w-4" />
        </Button>
    )
}