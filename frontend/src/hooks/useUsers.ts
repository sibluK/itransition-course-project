import { mapClerkUserToUser } from "@/lib/utils";
import type { User } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

export function useUsers() {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();

    const fetchUsers = async (): Promise<User[]> => {
        const { data } = await sendRequest<any>({
            method: "GET",
            url: "/admin/users"
        });
        return data.users.data.map((user: any) => {
            return mapClerkUserToUser(user);
        });
    };

    const changeUsersStatus = async (userIds: string[], action: 'ban' | 'unban'): Promise<void> => {
        await sendRequest({
            method: "POST",
            url: `/admin/users/${action}`,
            body: { userIds }
        });
    };

    const changeUserRole = async (userIds: string[], newRole: string): Promise<void> => {
        await sendRequest({
            method: "POST",
            url: "/admin/users/role",
            body: { userIds, newRole }
        });
    };

    const deleteUsers = async (userIds: string[]): Promise<void> => {
        await sendRequest({
            method: "POST",
            url: "/admin/users/delete",
            body: { userIds }
        });
    }

    const { data: users, isLoading, error } = useQuery({
        queryKey: ['users'],
        queryFn: fetchUsers
    });

    const { mutateAsync: updateUsersStatus } = useMutation({
        mutationFn: (params: {
            userIds: string[];
            action: 'ban' | 'unban';
        }) => changeUsersStatus(params.userIds, params.action),
        onSuccess: (_data, params) => {
            queryClient.setQueryData(['users'], (oldData: User[]) => {
                if (!oldData) return oldData;
                return oldData.map(user => {
                    if (params.userIds.includes(user.id)) {
                        return {
                            ...user,
                            status: params.action === 'ban' ? 'blocked' : 'active'
                        };
                    }
                    return user;
                });
            });
        }
    });

    const { mutateAsync: updateUsersRole } = useMutation({
        mutationFn: (params: {
            userIds: string[];
            newRole: string;
        }) => changeUserRole(params.userIds, params.newRole),
        onSuccess: (_data, params) => {
            queryClient.setQueryData(['users'], (oldData: User[]) => {
                if (!oldData) return oldData;
                return oldData.map(user => {
                    if (params.userIds.includes(user.id)) {
                        return {
                            ...user,
                            role: params.newRole
                        };
                    }
                    return user;
                });
            });
        }
    });

    const { mutateAsync: deleteUsersMutation } = useMutation({
        mutationFn: (userIds: string[]) => deleteUsers(userIds),
        onSuccess: (_data, userIds) => {
            queryClient.setQueryData(['users'], (oldData: User[]) => {
                if (!oldData) return oldData;
                return oldData.filter(user => !userIds.includes(user.id));
            });
        }
    });

    return {
        users,
        isLoading,
        error,
        updateUsersStatus,
        updateUsersRole,
        deleteUsers: deleteUsersMutation
    };
}

