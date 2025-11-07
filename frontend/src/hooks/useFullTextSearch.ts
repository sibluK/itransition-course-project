import { useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import type { Inventory } from "@/types/models";

interface UseFullTextSearchProps {
    query: string;
}

export function useFullTextSearch({ query }: UseFullTextSearchProps) {
    const { sendRequest } = useApiRequest();

    const search = async (): Promise<Inventory[]> => {
        if (!query) return [];
        const { data } = await sendRequest<Inventory[]>({
            method: "GET",
            url: `/search?q=${encodeURIComponent(query)}`
        });
        return data ?? [];
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ['fullTextSearch', { query }],
        queryFn: search,
        enabled: query.length > 0,
        staleTime: 1 * 60 * 1000
    });

    return { data, isLoading, error };
}