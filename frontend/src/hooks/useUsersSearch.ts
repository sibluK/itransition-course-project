import type { AccessUser } from "@/types/models";
import { useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

interface UseUserSearchProps {
    query: string;
}

export function useUsersSearch({ query }: UseUserSearchProps) {
    const { sendRequest } = useApiRequest();

    const searchUsers = async (): Promise<AccessUser[]> => {
        const { data } = await sendRequest<AccessUser[]>({
            method: "GET",
            url: `/users?search=${encodeURIComponent(query)}`
        });
        return data ?? [];
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["usersSearch", { query }],
        queryFn: searchUsers,
        enabled: query.length > 0,
        staleTime: 5 * 60 * 1000
    });

    return { data, isLoading, error };
}