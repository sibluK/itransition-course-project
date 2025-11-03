import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import LocaleSwitcher from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Package } from "lucide-react";
import { FullTextSearch } from "./full-text-search";

export function Navbar() {
    const isAdmin = useUserRole() === "admin";
    return (
        <nav className="flex items-center p-3 border-b gap-3 overflow-x-hidden w-full">
            <NavLink className="text-xl font-medium" to="/"><Package className="w-[30px] h-[30px]"/></NavLink>
            <div className="flex items-center gap-4 mr-auto">
                <NavLink className="hover:underline" to="/">Home</NavLink>
                <SignedIn>
                    {isAdmin && <NavLink className="hover:underline" to="/admin">Admin</NavLink>}
                    <NavLink className="hover:underline" to="/my-inventories">Inventories</NavLink>
                </SignedIn>
            </div>
            <FullTextSearch />
            <ThemeToggle />
            <LocaleSwitcher />
            <UserButton/>
            <SignedOut>
                <Button variant="default">
                    <SignInButton />
                </Button>
            </SignedOut>
        </nav>
    );
}