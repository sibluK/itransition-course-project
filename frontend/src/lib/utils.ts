import type { User } from "@/types/models";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function mapClerkUserToUser(clerkUser: any): User {
    return {
        id: clerkUser.id,
        name: clerkUser.firstName + " " + clerkUser.lastName,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        imageUrl: clerkUser.imageUrl || "",
        lastLogin: new Date(clerkUser.lastSignInAt),
        joinedAt: new Date(clerkUser.createdAt),
        role: clerkUser.publicMetadata?.role || "user",
        status: clerkUser.banned ? 'blocked' : 'active',
    };
}
