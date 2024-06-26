import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { 
    getRecipesByIngredientName,
    getAllIngredientsQueryOptions
 } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@/context/useSearch';
import Select from 'react-select';

type IngredientOption = {
    label: string;
    value: string;
};

export const Route = createFileRoute('/_authenticated/search')({
    component: Search
});

function Search() {
    // const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const { setResults } = useSearch();

    const { data } = useQuery(getAllIngredientsQueryOptions);
    const ingredientList: string[] = data ? data.ingredients.map(ingredient => ingredient.name) : [];
    const ingredientOptions: IngredientOption[] = ingredientList.map((ingredient) => ({
        label: ingredient,
        value: ingredient,
    }));

    console.log("ingredientOptions: ", ingredientOptions)

    const handleSearch = async () => {
        if (searchQuery.trim() !== '') {
            const results = await getRecipesByIngredientName(searchQuery.trim());
            setResults(results);
            navigate({ to: "/search-results" });
        }
    };

    return (
        <div className="p-2 max-w-3xl m-auto">
            <div className="mb-4 flex-col">
                <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-2 border rounded w-full text-black" 
                    placeholder="Search by ingredient name..."
                />
                <form>
                    <Select
                        defaultValue={[ingredientOptions[2], ingredientOptions[3]]}
                        isMulti
                        options={ingredientOptions}
                        // value={ingredientOptions.find(option => option.value === field.state.value)}
                        // onChange={(selectedOption) => {
                        //     console.log("selected option: ", selectedOption)
                        //     if (selectedOption) {
                        //         field.handleChange(selectedOption.value);
                        //     }
                        // }}

                        onChange={(value) => {
                            console.log("VALUE:", value)
                            return value
                        }}
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
