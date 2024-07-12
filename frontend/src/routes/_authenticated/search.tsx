import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
    getRecipesByIngredientName,
    getAllIngredientsQueryOptions
 } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@/context/useSearch';
import Select from 'react-select';
import { sanitizeString } from '../../lib/utils';
import { type IngredientOption } from '../../lib/types';

export const Route = createFileRoute('/_authenticated/search')({
    component: Search
});

function Search() {
    const [selectedIngredients, setSelectedIngredients] = useState<IngredientOption[]>([]);
    const navigate = useNavigate();
    const { setResults } = useSearch();

    const { data } = useQuery(getAllIngredientsQueryOptions);
    const ingredientList: string[] = data ? data.ingredients.map(ingredient => ingredient.name) : [];
    const ingredientOptions: IngredientOption[] = ingredientList.map((ingredient) => ({
        label: sanitizeString(ingredient),
        value: sanitizeString(ingredient),
    }));

    const handleSearch = async () => {
        if (selectedIngredients.length > 0) {
            const results = await getRecipesByIngredientName(selectedIngredients.map(ingredient => ingredient.value));
            setResults(results);
            navigate({ to: "/search-results" });
        }
    };

    return (
        <div className="p-2 max-w-3xl m-auto">
            <div className="mb-4 flex-col">
                <form>
                    <Select
                        defaultValue={[ingredientOptions[2], ingredientOptions[3]]}
                        isMulti
                        options={ingredientOptions}
                        value={selectedIngredients}
                        onChange={(selectedOptions) => setSelectedIngredients(selectedOptions as IngredientOption[])}
                        className="ingredient-name"
                    />
                </form>
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
