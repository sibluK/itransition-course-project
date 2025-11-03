import { useQuery } from "@tanstack/react-query";

interface UseFullTextSearchProps {
    query: string;
}

export function useFullTextSearch({ query }: UseFullTextSearchProps) {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const search = async () => {
        if (!query) return;

        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['fullTextSearch', { query }],
        queryFn: search,
        enabled: query.length > 0,
    });

    return { data, isLoading, error };
}