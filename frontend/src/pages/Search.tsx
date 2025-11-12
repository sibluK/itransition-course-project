import { useFullTextSearch } from "@/hooks/useFullTextSearch";
import { useSearchParams } from "react-router";
import { Link } from "react-router";
import type { Inventory } from "@/types/models";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";

export default function Search() {
    const [searchParams] = useSearchParams();
    const { t } = useTranslation();
    const query = searchParams.get("q") || "";
    const { data, isLoading } = useFullTextSearch({ query });

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">{t("search-results-for", { query: query })}</h1>
            {!isLoading ? (
                <ResultsList results={data || []} />
            ) : (
                <Spinner className="h-[50px] w-[50px] mx-auto my-5"/>
            )}
        </div>
    );
}

function ResultsList({ results }: { results: Inventory[] }) {
    const { t } = useTranslation();
    return (
        <div className="space-y-4">
            {results.map((inventory: Inventory) => (
                <ResultItem key={inventory.id} inventory={inventory} />
            ))}
            {results.length === 0 && (
                <p>{t("no_results_found")}</p>
            )}
        </div>
    );
}


function ResultItem({ inventory }: { inventory: Inventory }) {
    const { t } = useTranslation();
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
                        {t("time-created-on", { date: new Date(inventory.createdAt).toLocaleDateString() })}
                    </p>
                </div>
            </div>
        </div>
    );
}