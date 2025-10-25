import { UsersTable } from "@/components/users-table";
import { useUsers } from "@/hooks/useUsers";

export default function Admin() {
    const { users, isLoading, error } = useUsers();

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Page</h1>
            <p>Welcome to the admin dashboard. Here you can manage users, view reports, and configure system settings.</p>
            <div className="py-10">
                <UsersTable data={users || []} />
            </div>
        </div>
    );
}