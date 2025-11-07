import type { Inventory, Tag } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

interface UseInventoryProps {
    inventoryId: number;
}

interface InventoryResponse {
    inventory: Inventory;
    tags: Tag[];
    writeAccess: boolean;
}

export function useInventory({ inventoryId }: UseInventoryProps) {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();
    
    const fetchInventory = async (): Promise<InventoryResponse | null> => {
        const { data } = await sendRequest<InventoryResponse>({
            method: "GET",
            url: `/inventories/${inventoryId}`,
        });
        return data;
    }

    const deleteInventory = async (): Promise<void> => {
        await sendRequest({
            method: "DELETE",
            url: `/inventories/${inventoryId}`
        });
    }

    const { data, isLoading, error } = useQuery<InventoryResponse | null>({
        queryKey: ['inventory', { inventoryId }],
        queryFn: fetchInventory,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const { mutateAsync: deleteInventoryMutation } = useMutation({
        mutationFn: deleteInventory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
    });

    return {
        inventory: data?.inventory,
        tags: data?.tags || [],
        writeAccess: data?.writeAccess || false,
        isLoading,
        error,
        deleteInventory: deleteInventoryMutation,
    };
}