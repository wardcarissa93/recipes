import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSearch } from '@/context/useSearch';
import { sanitizeString } from '../../lib/utils';
import { type SearchResult } from '../../lib/types';

export const Route = createFileRoute('/_authenticated/search-results')({
    component: SearchResults
});

function SearchResults() {
    const { results } = useSearch();

    if (!results) {
        return <div className="p-2 max-w-3xl m-auto">No search results found.</div>;
    }

    console.log("RESULTS: ", results)

    return (
        <div className="p-2 max-w-3xl m-auto">
            Search results
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[100px]">Id</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Servings</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {results.recipes.map((recipe: SearchResult) => (
                        <TableRow key={recipe.id}>
                            <TableCell className="font-medium">{recipe.id}</TableCell>
                            <TableCell>
                                <Link to={`/recipe/${recipe.id}`}>{sanitizeString(recipe.title)}</Link>
                            </TableCell>
                            <TableCell>{recipe.servings}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}