import { SignedOut, SignInButton, SignedIn, UserButton } from "@clerk/clerk-react";
import { NavLink } from "react-router";
import { Button } from "./ui/button";
import { useUserRole } from "@/hooks/useUserRole";
import LocaleSwitcher from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { Input } from "./ui/input";
import { Search } from "lucide-react";
import { useState } from "react";
import { Package } from "lucide-react";

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
            <GlobalSearch />
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

function GlobalSearch() {
    const [query, setQuery] = useState("");

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        console.log("Searching for:", query);
    }

    return (
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
            <Button type="submit">
                <Search />
            </Button>
            <Input 
                type="text" 
                placeholder="Search..." 
                value={query} onChange={(e) => setQuery(e.target.value)}
            />
        </form>
    );
}