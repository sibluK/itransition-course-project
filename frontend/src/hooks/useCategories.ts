import { useQuery } from "@tanstack/react-query";

export function useCategories() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchCategories = async () => {
        const response = await fetch(`${API_URL}/categories`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000,
    })

    return {
        categories: data ?? [],
        isLoading,
        error,
    };
}