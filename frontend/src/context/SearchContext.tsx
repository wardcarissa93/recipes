import { createContext, useState, ReactNode } from 'react';

interface Recipe {
    id: number;
    title: string;
    servings: number;
}

interface SearchResult {
    recipes: Recipe[]
}

interface IngredientOption {
    label: string;
    value: string;
}

interface SearchContextType {
    results: SearchResult | null;
    setResults: (results: SearchResult | null) => void;
    selectedIngredients: IngredientOption[];
    setSelectedIngredients: (ingredients: IngredientOption[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [results, setResults] = useState<SearchResult | null>(null);
    const [selectedIngredients, setSelectedIngredients] = useState<IngredientOption[]>([]);
    return (
        <SearchContext.Provider value={{ results, setResults, selectedIngredients, setSelectedIngredients }}>
            {children}
        </SearchContext.Provider>
    );
};

export default SearchContext;