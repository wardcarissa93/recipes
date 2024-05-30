import { createContext, useState, ReactNode } from 'react';

interface Recipe {
    id: number;
    title: string;
    servings: number;
}

interface SearchResult {
    recipes: Recipe[]
}

interface SearchContextType {
    results: SearchResult | null;
    setResults: (results: SearchResult | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
    const [results, setResults] = useState<SearchResult | null>(null);
    return (
        <SearchContext.Provider value={{ results, setResults }}>
            {children}
        </SearchContext.Provider>
    );
};

export default SearchContext;