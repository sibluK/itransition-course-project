import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import LocaleSwitcher from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export function Navbar() {
    const isAdmin = useUserRole() === "admin";
    return (
        <nav className="flex items-center p-3 border-b gap-4 overflow-x-hidden">
            <NavLink className="text-xl font-medium" to="/">Inventory Manager</NavLink>
            <GlobalSearch />
            <div className="flex items-center gap-4 ml-auto">
                <NavLink className="hover:underline" to="/">Home</NavLink>
                <SignedOut>
                    <Button variant="default">
                        <SignInButton />
                    </Button>
                </SignedOut>
                <SignedIn>
                    {isAdmin && <NavLink className="hover:underline" to="/admin">Admin</NavLink>}
                    <NavLink className="hover:underline" to="/my-inventories">Inventories</NavLink>
                    <UserButton />
                </SignedIn>
                <ThemeToggle />
                <LocaleSwitcher />
            </div>
        </nav>
    );
}

function GlobalSearch() {
    const [query, setQuery] = useState("");

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        console.log("Searching for:", query);
    }

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
            <Input 
                type="text" 
                placeholder="Search..." 
                value={query} onChange={(e) => setQuery(e.target.value)}
            />
            <Button type="submit">
                <Search />
            </Button>
        </form>
    );
}