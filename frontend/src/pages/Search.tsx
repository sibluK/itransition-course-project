import { useFullTextSearch } from "@/hooks/useFullTextSearch";
import { useSearchParams } from "react-router";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import type { Inventory } from "@/types/models";

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const { data, isLoading } = useFullTextSearch({ query });

    console.log("Search query:", query);
    console.log("Search results:", data);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Results for "{query}"</h1>
            {!isLoading ? (
                <ResultsList results={data || []} />
            ) : (
                <div>Loading search results...</div>
            )}
        </div>
    );
}

function ResultsList({ results }: { results: Inventory[] }) {
    return (
        <div className="space-y-4">
            {results.map((inventory: any) => (
                <ResultItem key={inventory.id} inventory={inventory} />
            ))}
        </div>
    );
}


function ResultItem({ inventory }: { inventory: Inventory}) {
    return (
        <div key={inventory.id} className="border rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <Link 
                        to={`/inventory/${inventory.id}`}
                        className="text-xl font-semibold hover:underline"
                    >
                        {inventory.title}
                    </Link>
                    <p className="text-gray-600 mt-1">{inventory.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Created {formatDistanceToNow(new Date(inventory.createdAt), { addSuffix: true })}
                    </p>
                </div>
            </div>
        </div>
    );
}