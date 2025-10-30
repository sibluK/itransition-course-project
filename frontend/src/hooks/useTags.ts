import { useQuery } from "@tanstack/react-query";

interface UseTagsProps {
    search: string;
}

export function useTags({ search }: UseTagsProps) {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchTags = async () => {
        const response = await fetch(`${API_URL}/tags?search=${search}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['tags', { search }],
        queryFn: fetchTags,
        staleTime: 10 * 60 * 1000,
    })

    return {
        tags: data ?? [],
        isLoading,
        error,
    };
}