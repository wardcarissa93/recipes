import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSearch } from '@/context/useSearch';
import { sanitizeString } from '../../lib/utils';
import { type SearchResult, type Recipe } from '../../lib/types';

export const Route = createFileRoute('/_authenticated/search-results')({
    component: SearchResults
});

function SearchResults() {
    const { results, selectedIngredients } = useSearch();
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 8;

    if (!results || !results.recipes) {
        return (
            <div className='p-2 max-w-xl m-auto'>
                <h2 className="text-center text-xl p-4"></h2>
            </div>
        );
    }

    const getMatchingIngredients = (recipe: Recipe) => {
        return recipe.ingredients?.filter(ingredient => 
            selectedIngredients.some(selected => selected.value === ingredient)
        ) || [];
    };

    const indexOfLastRecipe = currentPage * recipesPerPage;
    const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
    const currentRecipes = results.recipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
    const totalPages = Math.ceil(results.recipes.length / recipesPerPage);

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
        <div className="p-2">
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <h2 className="text-center p-4 text-xl">Recipes Containing '{selectedIngredients.map(ingredient => ingredient.label).join("' and/or '")}'</h2>
            <Table className="max-w-xl m-auto">
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-2/3">Recipe</TableHead>
                        <TableHead className="w-1/3">Contains</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {(currentRecipes.length === 0) ? 
                        <p className="p-4 mt-2">
                            No recipes found.
                        </p>
                    : currentRecipes.map((recipe: SearchResult) => (
                        <TableRow key={recipe.id}>
                            <TableCell>
                                <Link to={`/recipe/${recipe.id}`}>{sanitizeString(recipe.title)}</Link>
                            </TableCell>
                            <TableCell>
                                {getMatchingIngredients(recipe).map(ingredient => ingredient).join(", ")}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-center mt-8">
                    {renderPagination()}
            </div>
        </div>
    );
}
