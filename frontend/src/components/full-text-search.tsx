import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNavigate } from "react-router";

export function FullTextSearch() {
    const [query, setQuery] = useState("");
    const navigate = useNavigate();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (!query.trim()) return;
        navigate(`/search?q=${encodeURIComponent(query)}`);
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