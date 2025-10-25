import { useUser } from "@clerk/clerk-react";

export function useUserRole() {
    const { user } = useUser();
    return user?.publicMetadata?.role;
}