import type { InventoryWithCategoryAndTags } from "@/types/models";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";

interface GetUsersInventoriesResponse {
    ownedInventories: InventoryWithCategoryAndTags[];
    writeAccessInventories: InventoryWithCategoryAndTags[];
}

export function useUserInventories() {
    const { userId, isLoaded } = useAuth();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchUserInventories = async () => {
        if (!userId) return;

        try {
            const response = await fetch(`${API_URL}/inventories/users/${userId}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching inventories:', error);
        }
    }

    const { data, isLoading, error, refetch } = useQuery<GetUsersInventoriesResponse>({
        queryKey: ['inventories'],
        queryFn: fetchUserInventories,
        staleTime: 5 * 60 * 1000,
        enabled: isLoaded && !!userId,
    });

    return { 
        inventories: data ?? { ownedInventories: [], writeAccessInventories: [] },
        isLoading, 
        error,
        refetch
    };
}