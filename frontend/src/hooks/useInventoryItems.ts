import type { Item } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import { toast } from "sonner";

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
        const { data, code } = await sendRequest<Item>({
            method: "PATCH",
            url: `/items/${inventoryId}/${itemId}`,
            body: { ...updatedData, version }
        });
        if (code !== 200 || !data) {
            throw { 
                status: code,
                message: 'Failed to update item'
            };
        }

        return data;
    };

    const deleteItems = async (itemIds: number[]): Promise<void> => {
        await sendRequest<void>({
            method: "DELETE",
            url: `/items/${inventoryId}`,
            body: { itemIds }
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
            toast.success("Item created successfully");
        }
    });

    const { mutateAsync: updateItemMutation } = useMutation({
        mutationFn: ({ itemId, updatedData, version }: { itemId: number;  updatedData: Partial<Item>, version: number }) => updateItem( {itemId, updatedData, version} ),
        retry: false,
        onSuccess: (updatedItem) => {
            if (!updatedItem) return;
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[]) => {
                if (!oldData) return oldData;
                return oldData.map(item => item.id === updatedItem.id ? updatedItem : item);
            });
        },
        onError: async (error: any) => {
            console.error('Error updating item:', error);
            
            if (error.status === 409) {
                await queryClient.invalidateQueries({ queryKey: ["inventoryItems", { inventoryId }]});
                
                toast.error("Version Conflict", {
                    description: "Another user modified this item. The form has been closed and data refreshed. Please try again.",
                    duration: 5000,
                });
                
            } else {
                toast.error("Unable to save changes", {
                    description: "Something went wrong. Please try again.",
                });
            }
            
            throw error;
        }
    });

    const { mutateAsync: deleteItemMutation } = useMutation({
        mutationFn: (itemIds: number[]) => deleteItems(itemIds),
        onSuccess: (_, itemIds) => {
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[]) => {
                if (!oldData) return oldData;
                return oldData.filter(item => !itemIds.includes(item.id));
            });
            toast.success(`${itemIds.length} item(s) deleted successfully`);
        }
    });

    return {
        items: data || [],
        isLoading,
        error,
        createItem: createItemMutation,
        updateItem: updateItemMutation,
        deleteItems: deleteItemMutation,
    }
}