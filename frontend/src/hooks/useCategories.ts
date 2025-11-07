import { useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import type { Category } from "@/types/models";

export function useCategories() {
    const { sendRequest } = useApiRequest();

    const fetchCategories = async (): Promise<Category[]> => {
        const { data } = await sendRequest<Category[]>({
            method: "GET",
            url: "/categories"
        });
        return data ?? [];
    }

    const { data, isLoading, error } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories,
        staleTime: 10 * 60 * 1000
    })

    return {
        categories: data ?? [],
        isLoading,
        error
    };
}