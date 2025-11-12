import { HomeInventoriesTable } from "@/components/home-inventories-table";
import { useHomeInventories } from "@/hooks/useHomeInventories";

export default function Home() {
    const { data, isLoading } = useHomeInventories();

    return (
        <div className="flex justify-around flex-wrap gap-10">
            <section className="flex-1">
                <h1 className="text-2xl font-bold mb-4">Latest Inventories</h1>
                <HomeInventoriesTable 
                    data={data?.latestInventories || []}
                    loading={isLoading}
                />
            </section>
            <section className="flex-1">
                <h1 className="text-2xl font-bold mb-4">Popular Inventories</h1>
                <HomeInventoriesTable 
                    data={data?.popularInventories || []}
                    loading={isLoading}
                />
            </section>
        </div>
    );
}