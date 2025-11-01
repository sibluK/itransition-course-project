import type { AccessUser } from "@/types/models";
import { useQuery } from "@tanstack/react-query";

interface UseUserSearchProps {
    query: string;
}

export function useUsersSearch({ query }: UseUserSearchProps) {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const searchUsers = async () => {
        const response = await fetch(`${API_URL}/users?search=${encodeURIComponent(query)}`, {
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to search users");
        }
        return response.json();
    };

    const { data, isLoading, error } = useQuery<AccessUser[]>({
        queryKey: ["usersSearch", { query }],
        queryFn: searchUsers,
        staleTime: 5 * 60 * 1000,
        enabled: query.length > 0,
    });

    return { data, isLoading, error };
}