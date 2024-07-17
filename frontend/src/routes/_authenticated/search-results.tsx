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
    console.log("results: ", results)

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
                    {results.recipes.map((recipe: SearchResult) => (
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
        </div>
    );
}
