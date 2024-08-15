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
import { StylesConfig } from 'react-select';

export const Route = createFileRoute('/_authenticated/search')({
    component: Search
});

const searchBarStyles: StylesConfig<IngredientOption, true> = {
    container: (provided) => ({
        ...provided,
        display: 'flex',
        flexWrap: 'wrap',
    }),
    control: (provided, state) => ({
        ...provided,
        minHeight: '40px',
        maxHeight: '200px',
        overflowY: 'auto',
        width: '575px',
        borderColor: state.isFocused ? '#818cf8' : provided.borderColor,
        borderWidth: state.isFocused ? '2px' : provided.borderWidth,
        boxShadow: state.isFocused ? `0 0 0 1px #818cf8` : provided.boxShadow,
    }),
    valueContainer: (provided) => ({
        ...provided,
        display: 'flex',
        flexWrap: 'wrap',
        padding: '5px',
    }),
    multiValue: (provided) => ({
        ...provided,
        backgroundColor: '#e4e7eb',
        borderRadius: '3px',
        margin: '2px',
    }),
    multiValueLabel: (provided) => ({
        ...provided,
        fontSize: '0.85rem',
    }),
    multiValueRemove: (provided) => ({
        ...provided,
        cursor: 'pointer',
    }),
    menu: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
    menuPortal: (provided) => ({
        ...provided,
        zIndex: 9999,
    }),
};

function Search() {
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

export default Search;
