import type { Inventory, Tag } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    
    const fetchInventory = async () => {
        const response = await fetch(`${API_URL}/inventories/${inventoryId}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    }

    const deleteInventory = async () => {
        const response = await fetch(`${API_URL}/inventories/${inventoryId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to delete inventory');
        }
        return true;
    }

    const { data, isLoading, error } = useQuery<InventoryResponse>({
        queryKey: ['inventory', { inventoryId }],
        queryFn: fetchInventory,
        staleTime: 10 * 60 * 1000,
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