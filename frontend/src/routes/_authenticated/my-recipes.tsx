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
    getAllRecipesQueryOptions,
    getAllCategoriesQueryOptions,
    loadingCreateRecipeQueryOptions,
    deleteRecipe,
    getCategoryIdByName,
    getRecipesByCategoryId
} from '@/lib/api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash, Edit } from 'lucide-react'
import { toast } from 'sonner';
import Select from 'react-select';
import { useNavigate } from '@tanstack/react-router'
import { sanitizeString, singleSelectStyles } from '../../lib/utils'
import { 
    type Recipe, 
    type CategoryOption,
    type FilteredRecipe
} from '../../lib/types'

export const Route = createFileRoute('/_authenticated/my-recipes')({
    component: MyRecipes
})

function MyRecipes() {
    const { isPending: recipePending, error: recipeError, data: recipeData } = useQuery(getAllRecipesQueryOptions);
    const { error: categoriesError, data: categoriesData } = useQuery(getAllCategoriesQueryOptions);
    const { data: loadingCreateRecipe } = useQuery(loadingCreateRecipeQueryOptions);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<CategoryOption>();
    const [filterText, setFilterText] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
    const recipesPerPage = 8;


    const categoryOptions: CategoryOption[] = categoriesData ? categoriesData.categories.map(category => ({
        label: category.categoryName,
        value: category.categoryName
    })) : [];

    useEffect(() => {
        const filterRecipes = async () => {
            if (recipeData) {
                let sanitizedRecipes = recipeData.recipes.map((recipe: Recipe) => ({
                    id: recipe.id,
                    title: sanitizeString(recipe.title)
                }));
    
                if (selectedCategory) {
                    try {
                        const categoryId = await getCategoryIdByName(selectedCategory.label);
                        const recipesInCategory = await getRecipesByCategoryId(categoryId);
                        sanitizedRecipes = recipesInCategory.recipeCategories.map((recipe: FilteredRecipe) => ({
                            id: recipe.recipeId,
                            title: sanitizeString(recipe.title)
                        }));
                    } catch (error) {
                        console.error("Error fetching categoryId: ", error);
                    }
                }
    
                sanitizedRecipes.sort((a, b) => a.title.localeCompare(b.title));
    
                const filtered = sanitizedRecipes.filter(recipe => 
                    recipe.title.toLowerCase().includes(filterText.toLowerCase())
                );
    
                setFilteredRecipes(filtered);
            }
        };
    
        filterRecipes();
    }, [recipeData, filterText, selectedCategory]);    

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const displayedRecipes = filteredRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);

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

    if (recipeError) return 'An error has occurred: ' + recipeError.message

    if (categoriesError) return 'An error has occurred: ' + categoriesError.message

    
    return (
        <div className="p-2 max-w-xl m-auto">
            <div className="flex justify-between gap-8 mb-4">
                <Link to="/create-recipe" className="[&.active]:font-bold">
                    <Button className="w-[140px]">
                        Create Recipe
                    </Button>
                </Link>
                <Input 
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="Search for recipe by title"
                />
            </div>
            <div className="flex justify-between mb-2">
                <p className="mt-2 ml-4 text-sm">Filter by Category: </p>
                <form className="w-[388px]">
                    <Select
                        options={categoryOptions}
                        value={selectedCategory}
                        onChange={(selectedOption) => setSelectedCategory(selectedOption as CategoryOption)}
                        className="ingredient-name"
                        styles={singleSelectStyles}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary: '#818cf8',
                            },
                        })}
                    />
                </form>
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Recipe</TableHead>
                        <TableHead className="w-1/6"><p className="px-2">Edit</p></TableHead>
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
                    {recipePending 
                    ? Array(3).fill(0).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                            <TableCell><Skeleton className="h-4"></Skeleton></TableCell>
                        </TableRow>
                    )) 
                    : (
                        (displayedRecipes.length === 0) ? 
                            <p className="p-4 mt-2">
                                No recipes found.
                            </p>
                        : displayedRecipes.map((recipe) => (
                            <TableRow key={recipe.id}>
                                <TableCell>
                                    <Link to="/recipe/$recipeId" params={{ recipeId: recipe.id.toLocaleString() }}>
                                        {recipe.title}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <EditRecipeButton id={recipe.id}/>
                                </TableCell>
                                <TableCell>
                                    <DeleteRecipeButton id={recipe.id} title={recipe.title}/>
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

function EditRecipeButton({ id }: { id: number }) {
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
            className="border-indigo-400"
        >
            <Edit className="h-4 w-4"/>
        </Button>
    )
}

function DeleteRecipeButton({ id, title }: { id: number, title: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: deleteRecipe,
        onError: (error) => {
            console.error('Error deleting recipe: ', error);
            toast("Error", {
                description: error.message || `Failed to delete recipe '${title}'`,
            });
        },
        onSuccess: () => {
            toast("Recipe Deleted", {
                description: `Successfully deleted recipe: '${title}'`,
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
            className="border-red-500 hover:bg-red-500"
        >
            {mutation.isPending ? "..." : <Trash className="h-4 w-4" />}
        </Button>
    );
}