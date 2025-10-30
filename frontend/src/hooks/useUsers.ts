import { mapClerkUserToUser } from "@/lib/utils";
import type { User } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useUsers = () => {
    const queryClient = useQueryClient();

    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

    const fetchUsers = async () => {
        const response = await fetch(`${API_URL}/admin/users`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        console.log("Fetched users data:", data);
        return data.users.data.map((user: any) => {
            return mapClerkUserToUser(user);
        });
    };

    const changeUsersStatus = async (userIds: string[], action: 'ban' | 'unban') => {
        const response = await fetch(`${API_URL}/admin/users/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userIds }),
        });
        if (!response.ok) {
            throw new Error(`Failed to ${action} users`);
        }
        const data = await response.json();
        return data;
    };

    const changeUserRole = async (userIds: string[], newRole: string) => {
        const response = await fetch(`${API_URL}/admin/users/role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userIds, newRole }),
        });
        if (!response.ok) {
            throw new Error(`Failed to update user roles`);
        }
        const data = await response.json();
        return data;
    };

    const deleteUsers = async (userIds: string[]) => {
        const response = await fetch(`${API_URL}/admin/users/delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ userIds }),
        });
        if (!response.ok) {
            throw new Error(`Failed to delete users`);
        }
        const data = await response.json();
        return data;
    }

    const { data: users, isLoading, error } = useQuery<User[]>({
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

