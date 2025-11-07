import type { Item } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

interface UseInventoryItems {
    inventoryId: number;
}

export function useInventoryItems({ inventoryId }: UseInventoryItems) {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest(); 

    const getItems = async (): Promise<Item[]> => {
        const { data } = await sendRequest<Item[]>({
            method: "GET",
            url: `/items/${inventoryId}`
        });
        return data ?? [];
    };

    const createItem = async (itemData: Record<string, any>): Promise<Item | null> => {
        const { data } = await sendRequest<Item>({
            method: "POST",
            url: `/items/${inventoryId}`,
            body: { itemData }
        });
        return data;
    };

    const updateItem = async ({itemId, updatedData, version}: { itemId: number; updatedData: Partial<Item>; version: number }): Promise<Item | null> => {
        const { data } = await sendRequest<Item>({
            method: "PATCH",
            url: `/items/${inventoryId}/${itemId}`,
            body: { ...updatedData, version }
        });
        return data;
    };

    const deleteItem = async (itemId: number, version: number): Promise<void> => {
        await sendRequest<void>({
            method: "DELETE",
            url: `/items/${inventoryId}/${itemId}`,
            body: { version }
        });
    };

    const { data, isLoading, error } = useQuery<Item[]>({
        queryKey: ['inventoryItems', { inventoryId }],
        queryFn: getItems,
        enabled: !!inventoryId,
        staleTime: 1 * 60 * 1000
    });

    const { mutateAsync: createItemMutation } = useMutation({
        mutationFn: (itemData: Record<string, any>) => createItem(itemData),
        onSuccess: (newItem) => {
            if (!newItem) return;
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[]) => {
                if (!oldData) return [newItem];
                return [...oldData, newItem];
            });
        }
    });

    const { mutateAsync: updateItemMutation } = useMutation({
        mutationFn: ({ itemId, updatedData, version }: { itemId: number;  updatedData: Partial<Item>, version: number }) => updateItem( {itemId, updatedData, version} ),
        onSuccess: (updatedItem) => {
            if (!updatedItem) return;
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[]) => {
                if (!oldData) return oldData;
                return oldData.map(item => item.id === updatedItem.id ? updatedItem : item);
            });
        }
    });

    const { mutateAsync: deleteItemMutation } = useMutation({
        mutationFn: ({ itemId, version }: { itemId: number; version: number }) => deleteItem(itemId, version),
        onSuccess: (_, { itemId }) => {
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[]) => {
                if (!oldData) return oldData;
                return oldData.filter(item => item.id !== itemId);
            });
        }
    });

    return {
        items: data || [],
        isLoading,
        error,
        createItem: createItemMutation,
        updateItem: updateItemMutation,
        deleteItem: deleteItemMutation,
    }
}