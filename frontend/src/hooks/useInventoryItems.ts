import type { Item } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { version } from "react";

interface UseInventoryItems {
    inventoryId: number;
}

export function useInventoryItems({ inventoryId }: UseInventoryItems) {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const queryClient = useQueryClient();

    const getItems = async () => {
        const response = await fetch(`${API_URL}/items/${inventoryId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch items');
        }
        const data = await response.json();
        return data;
    }

    const createItem = async ({ itemData }: { itemData: Record<string, any> }) => {
        const response = await fetch(`${API_URL}/items/${inventoryId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(itemData),
        });
        if (!response.ok) {
            throw new Error('Failed to create item');
        }
        const data = await response.json();
        return data;
    }

    const updateItem = async (itemId: number, updatedData: Partial<Item>, version: number) => {
        const response = await fetch(`${API_URL}/items/${inventoryId}/${itemId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ...updatedData, version }),
        });
        if (!response.ok) {
            throw new Error('Failed to update item');
        }
        const data = await response.json();
        return data;
    }

    const deleteItem = async (itemId: number, version: number) => {
        const response = await fetch(`${API_URL}/items/${inventoryId}/${itemId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(version),
        });
        if (!response.ok) {
            throw new Error('Failed to delete item');
        }
        const data = await response.json();
        return data;
    }

    const { data, isLoading, error } = useQuery<Item[]>({
        queryKey: ['inventoryItems', { inventoryId }],
        queryFn: getItems,
        enabled: !!inventoryId,
    });

    const { mutateAsync: createItemMutation } = useMutation({
        mutationFn: ({ itemData }: { itemData: Record<string, any> }) => createItem({ itemData }),
        onSuccess: (newItem: Item) => {
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[] | undefined) => {
                if (!oldData) return [newItem];
                return [...oldData, newItem];
            });
        }
    });

    const { mutateAsync: updateItemMutation } = useMutation({
        mutationFn: ({ itemId, updatedData, version }: { itemId: number;  updatedData: Partial<Item>, version: number }) => updateItem(itemId, updatedData, version),
        onSuccess: (updatedItem: Item) => {
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[] | undefined) => {
                if (!oldData) return oldData;
                return oldData.map(item => item.id === updatedItem.id ? updatedItem : item);
            });
        }
    });

    const { mutateAsync: deleteItemMutation } = useMutation({
        mutationFn: ({ itemId, version }: { itemId: number; version: number }) => deleteItem(itemId, version),
        onSuccess: (_, { itemId }) => {
            queryClient.setQueryData(['inventoryItems', { inventoryId }], (oldData: Item[] | undefined) => {
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