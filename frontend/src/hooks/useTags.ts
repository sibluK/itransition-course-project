import { useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import type { Tag } from "@/types/models";

interface UseTagsProps {
    search: string;
}

export function useTags({ search }: UseTagsProps) {
    const { sendRequest } = useApiRequest();

    const fetchTags = async () => {
        const { data } = await sendRequest<Tag[]>({
            method: "GET",
            url: `/tags?search=${encodeURIComponent(search)}`
        });
        return data ?? [];
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