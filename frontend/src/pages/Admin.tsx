import { UsersTable } from "@/components/users-table";
import { useUsers } from "@/hooks/useUsers";

export default function Admin() {
    const { 
        users, 
        isLoading, 
        error, 
        updateUsersStatus, 
        updateUsersRole,
        deleteUsers
    } = useUsers();

    return (
        <div>
            <div className="px-5">
                <UsersTable 
                    data={users || []} 
                    updateUsersStatus={updateUsersStatus} 
                    updateUsersRole={updateUsersRole}
                    deleteUsers={deleteUsers}
                />
            </div>
        </div>
    );
}