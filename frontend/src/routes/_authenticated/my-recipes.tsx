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
import { 
    getAllRecipesQueryOptions,
    loadingCreateRecipeQueryOptions,
    deleteRecipe
} from '@/lib/api'
import DOMPurify from 'dompurify'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Trash, Edit } from 'lucide-react'
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/my-recipes')({
    component: MyRecipes
})

function MyRecipes() {
    const { isPending, error, data } = useQuery(getAllRecipesQueryOptions);
    const { data: loadingCreateRecipe } = useQuery(loadingCreateRecipeQueryOptions);
    if (error) return 'An error has occurred: ' + error.message
    return (
        <div className="p-2 max-w-3xl m-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Servings</TableHead>
                        <TableHead>Edit</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loadingCreateRecipe?.recipe && (
                        <TableRow>
                            <TableCell className="font-medium">
                                <Skeleton className="h-4"></Skeleton>
                            </TableCell>
                            <TableCell>{loadingCreateRecipe?.recipe.title}</TableCell>
                            <TableCell>{loadingCreateRecipe?.recipe.servings}</TableCell>
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
                            <TableCell className="font-medium"><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                        </TableRow>
                    )) 
                    : data?.recipes.map((recipe) => (
                        <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{recipe.id}</TableCell>
                            <TableCell>
                                <Link to="/recipe/$recipeId" params={{ recipeId: recipe.id.toLocaleString() }}>
                                    {DOMPurify.sanitize(recipe.title)}
                                </Link>
                            </TableCell>
                            <TableCell>{recipe.servings}</TableCell>
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