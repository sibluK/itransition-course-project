import type { InventoryWithCategoryAndTags } from "@/types/models";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

interface GetUsersInventoriesResponse {
    ownedInventories: InventoryWithCategoryAndTags[];
    writeAccessInventories: InventoryWithCategoryAndTags[];
}

export function useUserInventories() {
    const { userId, isLoaded } = useAuth();
    const { sendRequest } = useApiRequest();

    const fetchUserInventories = async (): Promise<GetUsersInventoriesResponse | null> => {
        const { data } = await sendRequest<GetUsersInventoriesResponse | null>({
            method: "GET",
            url: `/inventories/users/${userId}`
        });
        return data;
    }

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['inventories'],
        queryFn: fetchUserInventories,
        enabled: isLoaded && !!userId,
        staleTime: 5 * 60 * 1000
    });

    return { 
        inventories: data ?? { ownedInventories: [], writeAccessInventories: [] },
        isLoading, 
        error,
        refetch
    };
}