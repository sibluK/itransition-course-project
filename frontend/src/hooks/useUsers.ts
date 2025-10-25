import { mapClerkUserToUser } from "@/lib/utils";
import type { User } from "@/types/models";
import { useQuery } from "@tanstack/react-query"

export const useUsers = () => {
    const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

    const fetchUsers = async () => {
        const response = await fetch(`${API_URL}/admin/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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
    }

    const { data: users, isLoading, error } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: fetchUsers,
    })

    return { users, isLoading, error }
}

