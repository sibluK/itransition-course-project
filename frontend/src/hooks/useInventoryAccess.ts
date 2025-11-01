import type { AccessUser } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface UseInventoryAccessParams {
    inventoryId: number;
    search: string;
}

export function useInventoryAccess({ inventoryId, search }: UseInventoryAccessParams) {
    const queryClient = useQueryClient();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchUsersWithWriteAccess = async (inventoryId: number) => {
        const response = await fetch(`${API_URL}/access/inventories/${inventoryId}/users?search=${search}`, {
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch users with write access");
        }
        return response.json();
    }

    const addUserToWriteAccess = async ({ inventoryId, userId }: { inventoryId: number; userId: string }) => {
        const response = await fetch(`${API_URL}/access/inventories/${inventoryId}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ targetUserId: userId }),
        });
        if (!response.ok) {
            throw new Error("Failed to add user to write access");
        }
        return response.json();
    }

    const removeUsersFromWriteAccess = async ({ inventoryId, userIds }: { inventoryId: number; userIds: string[] }) => {
        const response = await fetch(`${API_URL}/access/inventories/${inventoryId}/users`, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userIds }),
        });
        if (!response.ok) {
            throw new Error("Failed to remove user from write access");
        }
        return userIds;
    }

    const { data: usersWithWriteAccess, isLoading, error, refetch } = useQuery<AccessUser[]>({
        queryKey: ["inventoryAccess", { inventoryId, search }],
        queryFn: () => fetchUsersWithWriteAccess(inventoryId),
        staleTime: 5 * 60 * 1000,
        enabled: !!inventoryId && search !== undefined,
    });

    const { mutateAsync: addUserToWriteAccessMutation } = useMutation({
        mutationFn: addUserToWriteAccess,
        onSuccess: (data) => {
            queryClient.setQueryData<AccessUser[]>(["inventoryAccess", { inventoryId, search }], (oldData) => {
                if (oldData) {
                    return [...oldData, data];
                }
                return [data];
            });
        },
    });

    const { mutateAsync: removeUsersFromWriteAccessMutation } = useMutation({
        mutationFn: removeUsersFromWriteAccess,
        onSuccess: (userIds) => {
            queryClient.setQueryData<AccessUser[]>(["inventoryAccess", { inventoryId, search }], (oldData) => {
                if (oldData) {
                    return oldData.filter(user => !userIds.includes(user.id));
                }
                return [];
            });
        },
    });

    return {
        usersWithWriteAccess,
        isLoading,
        error,
        refetch,
        addUserToWriteAccess: addUserToWriteAccessMutation,
        removeUsersFromWriteAccess: removeUsersFromWriteAccessMutation,
    };

}