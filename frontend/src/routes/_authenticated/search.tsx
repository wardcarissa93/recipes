import { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getRecipesByIngredientName } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import { useSearch } from '@/context/useSearch';

export const Route = createFileRoute('/_authenticated/search')({
    component: Search
});

function Search() {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { setResults } = useSearch();

    const handleSearch = async () => {
        if (searchQuery.trim() !== '') {
            const results = await getRecipesByIngredientName(searchQuery.trim());
            setResults(results);
            navigate({ to: "/search-results" });
        }
    };

    return (
        <div className="p-2 max-w-3xl m-auto">
            <div className="mb-4 flex">
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded w-full text-black" 
                    placeholder="Search by ingredient name..."
                />
                <button
                    onClick={handleSearch}
                    className="ml-2 p-2 bg-blue-500 text-white rounded"
                >
                    Search
                </button>
            </div>
        </div>
    );
}
