import { useUserRole } from "@/hooks/useUserRole";
import type { Roles } from "@/types/globals";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";

interface ProtectedRouteProps {
    requiredRoles: Roles[];
    children: React.ReactNode
}

export default function ProtectedRoute({ requiredRoles, children }: ProtectedRouteProps) {
    const { isSignedIn } = useUser();
    const role = useUserRole();
    const navigate = useNavigate();

    if (!isSignedIn) {
        console.log("User is not signed in, redirecting to home.");
        navigate('/');
    }

    if (!requiredRoles.find(r => r === role)) {
        console.log(`User does not have required role. Required: ${requiredRoles.join(', ')}, but user role is: ${role}. Redirecting to home.`);
        navigate('/');
    }
    
    return <>{children}</>;
}