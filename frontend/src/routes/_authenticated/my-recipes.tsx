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
    getAllRecipesQueryOptions,
    loadingCreateRecipeQueryOptions,
    deleteRecipe
} from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Trash, Edit } from 'lucide-react'
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router'
import { sanitizeString } from '../../lib/utils'
import { type Recipe } from '../../lib/types'

export const Route = createFileRoute('/_authenticated/my-recipes')({
    component: MyRecipes
})

function MyRecipes() {
    const { isPending, error, data } = useQuery(getAllRecipesQueryOptions);
    const { data: loadingCreateRecipe } = useQuery(loadingCreateRecipeQueryOptions);
    const [isAscendingOrder, setIsAscendingOrder] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 8;

    if (error) return 'An error has occurred: ' + error.message

    const sanitizedRecipes = data?.recipes.map((recipe: Recipe) => ({
        ...recipe,
        title: sanitizeString(recipe.title),
    })) || [];

    const toggleSortOrder = () => {
        setIsAscendingOrder(!isAscendingOrder);
    };

    const sortedRecipes = [...sanitizedRecipes].sort((a, b) => {
        if (isAscendingOrder) {
            return a.title.localeCompare(b.title);
        } else {
            return b.title.localeCompare(a.title);
        }
    });

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = sortedRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    }
    
    return (
        <div className="p-2 max-w-xl m-auto">
            <div className="flex justify-between">
                <Button onClick={toggleSortOrder}>
                    {isAscendingOrder ? 'Sort Recipes Z-A' : 'Sort Recipes A-Z'}
                </Button>
                <Link to="/search" className="[&.active]:font-bold">
                    <Button>
                        Search for Recipe
                    </Button>
                </Link>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Title</TableHead>
                        <TableHead className="w-1/6">Edit</TableHead>
                        <TableHead className="w-1/6">Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingCreateRecipe?.recipe && (
                        <TableRow>
                            <TableCell>{loadingCreateRecipe?.recipe.title}</TableCell>
                            <TableCell>
                                <Skeleton className='h-4'/>
                            </TableCell>
                            <TableCell className='font-medium'>
                                <Skeleton className="h-4"/>
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
                    : currentRecipes.map((recipe) => (
                        <TableRow key={recipe.id}>
                            <TableCell>
                                <Link to="/recipe/$recipeId" params={{ recipeId: recipe.id.toLocaleString() }}>
                                    {recipe.title}
                                </Link>
                            </TableCell>
                            <TableCell>
                                <RecipeEditButton id={recipe.id}/>
                            </TableCell>
                            <TableCell>
                                <RecipeDeleteButton id={recipe.id}/>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-center mt-8">
                {Array.from({ length: Math.ceil(sortedRecipes.length / recipesPerPage) }, (_, index) => (
                    <Button 
                        key={index} 
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 ${currentPage === index + 1 ? 'bg-gray-300' : ''}`}
                    >
                        {index + 1}
                    </Button>
                ))}
            </div>
        </div>
    )
}

function RecipeEditButton({ id }: { id: number }) {
    const navigate = useNavigate();
    const handleEdit = () => {
        navigate({
            to: `/edit-recipe/$recipeId`,
            params: { recipeId: id.toString() }
        });
    };

    return (
        <Button 
            onClick={handleEdit}
            variant="outline"
            size="icon"
        >
            <Edit className="h-4 w-4"/>
        </Button>
    )
}

function RecipeDeleteButton({ id }: { id: number }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipe,
        onError: () => {
            toast("Error", {
                description: `Failed to delete recipe: ${id}`,
            });
        },
        onSuccess: () => {
            toast("Recipe Deleted", {
                description: `Successfully deleted recipe: ${id}`,
            })
            queryClient.setQueryData(
                getAllRecipesQueryOptions.queryKey,
                (existingRecipes) => ({
                    ...existingRecipes,
                    recipes: existingRecipes!.recipes.filter((e) => e.id !== id),
                })
            );
        },
    });

    return (
        <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id })}
            variant="outline"
            size="icon"
        >
            {mutation.isPending ? "..." : <Trash className="h-4 w-4" />}
        </Button>
    );
}