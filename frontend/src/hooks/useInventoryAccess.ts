import type { AccessUser } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

interface UseInventoryAccessParams {
    inventoryId: number;
    search: string;
}

export function useInventoryAccess({ inventoryId, search }: UseInventoryAccessParams) {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();

    const fetchUsersWithWriteAccess = async (inventoryId: number): Promise<AccessUser[]> => {
        const { data } = await sendRequest<AccessUser[]>({
            method: "GET",
            url: `/access/inventories/${inventoryId}/users?search=${search}`
        });
        return data ?? [];
    }

    const addUserToWriteAccess = async ({ inventoryId, userId }: { inventoryId: number; userId: string }): Promise<AccessUser | null> => {
        const { data } = await sendRequest<AccessUser>({
            method: "POST",
            url: `/access/inventories/${inventoryId}/users`,
            body: { targetUserId: userId }
        });
        return data || null;
    }

    const removeUsersFromWriteAccess = async ({ inventoryId, userIds }: { inventoryId: number; userIds: string[] }): Promise<void> => {
        await sendRequest({
            method: "DELETE",
            url: `/access/inventories/${inventoryId}/users`,
            body: { userIds }
        });
    }

    const { data: usersWithWriteAccess, isLoading, error, refetch } = useQuery<AccessUser[]>({
        queryKey: ["inventoryAccess", { inventoryId, search }],
        queryFn: () => fetchUsersWithWriteAccess(inventoryId),
        enabled: !!inventoryId && search !== undefined,
        staleTime: 5 * 60 * 1000
    });

    const { mutateAsync: addUserToWriteAccessMutation } = useMutation({
        mutationFn: addUserToWriteAccess,
        onSuccess: (data) => {
            if (!data) return;
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
        onSuccess: (_, params) => {
            queryClient.setQueryData<AccessUser[]>(["inventoryAccess", { inventoryId, search }], (oldData) => {
                if (oldData) {
                    return oldData.filter(user => !params.userIds.includes(user.id));
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