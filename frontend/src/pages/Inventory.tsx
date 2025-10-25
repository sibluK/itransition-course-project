import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react";

const tabs = [
    { value: 'items', label: 'Items' },
    { value: 'discussions', label: 'Discussions' },
    { value: 'settings', label: 'Settings' },
    { value: 'custom', label: 'Custom IDs' },
    { value: 'access', label: 'Access' },
    { value: 'fields', label: 'Fields' },
    { value: 'statistics', label: 'Statistics' },
];

export default function Inventory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const activeTab = useMemo(() => {
        const segments = location.pathname.split('/');
        console.log("Path Segments:", segments);
        return segments[segments.length - 1] || 'items';
    }, [location.pathname]);

    function handleTabChange(value: string) {
        navigate(`/inventories/${id}/${value}`);
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Inventory Page</h1>
            <p>This is the inventory page where you can view and manage a specific inventory.</p>
            <p>Inventory ID: {id}</p>
            <Tabs value={activeTab} onValueChange={handleTabChange} >
                <TabsList className="w-full" >
                    {tabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
            <Outlet />
        </div>
    );
}