// import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
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


const searchBarStyles = {
    control: (provided) => ({
        ...provided,
        minHeight: '40px',
        height: '40px',
        boxShadow: 'none',
        '&:hover': {
            border: '2px solid #818cf8'
        }
    }),
    valueContainer: (provided) => ({
        ...provided,
        height: '40px',
        padding: '0 6px'
    }),
    input: (provided) => ({
        ...provided,
        margin: '0px'
    }),
    indicatorSeparator: () => ({
        display: 'none'
    }),
    indicatorsContainer: (provided) => ({
        ...provided,
        height: '40px'
    })
};

function Search() {
    // const [selectedIngredients, setSelectedIngredients] = useState<IngredientOption[]>([]);
    const navigate = useNavigate();
    const { setResults, selectedIngredients, setSelectedIngredients } = useSearch();

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
        <div className="p-2">
            <Button onClick={() => window.history.back()}>
                Back
            </Button>
            <h2 className="text-center p-4 text-xl">Search for Recipe by Ingredient(s)</h2>
            <form className="max-w-xl m-auto">
                <Select
                    defaultValue={[ingredientOptions[2], ingredientOptions[3]]}
                    isMulti
                    options={ingredientOptions}
                    value={selectedIngredients}
                    onChange={(selectedOptions) => setSelectedIngredients(selectedOptions as IngredientOption[])}
                    className="ingredient-name"
                    styles={searchBarStyles}
                />
            </form>
            <Button
                onClick={handleSearch}
                className="mt-8 mx-auto flex"
            >
                Search
            </Button>
        </div>
    );
}
