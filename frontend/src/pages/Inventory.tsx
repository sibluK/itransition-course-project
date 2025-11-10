import { Outlet, useLocation, useNavigate, useParams } from "react-router";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemo } from "react";
import { useInventory } from "@/hooks/useInventory";
import { InventoryProvider, useInventoryContext } from "@/contexts/inventory-provider";
import { Spinner } from "@/components/ui/spinner";
import { AlertTriangle, Check } from "lucide-react";
import { InventorySocketProvider } from "@/contexts/inventory-socket-provider";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@clerk/clerk-react";

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
    const { inventoryId } = useParams();
    const { inventory, tags, writeAccess, isLoading, error } = useInventory({ inventoryId: Number(inventoryId) });
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useAuth();
    const isOwner = inventory?.creatorId === userId;
    const isAdmin = useUserRole() === 'admin';

    const activeTab = useMemo(() => {
        const segments = location.pathname.split('/');
        return segments[segments.length - 1] || 'items';
    }, [location.pathname]);

    function handleTabChange(value: string) {
        navigate(`/inventory/${inventoryId}/${value}`);
    }

    if (isLoading) {
        return <Spinner className="mx-auto w-[35px] h-[35px]" />; 
    }

    if (error || !inventory) {
        return <div>Error loading inventory. Please try again.</div>; 
    }

    return (
        <InventoryProvider initialData={{...inventory, tags: tags.map(t => t.name)}} inventoryId={Number(inventoryId)} writeAccess={writeAccess}>
            <InventorySocketProvider inventoryId={Number(inventoryId)} hasWriteAccess={writeAccess}>    
                <div>
                    <div className="flex items-center gap-4 mb-4 justify-between lg:justify-start flex-wrap">
                        <h1 className="text-2xl lg:text-4xl font-bold text-nowrap">{inventory.title}</h1>
                        {(isOwner || isAdmin) && <AutoSaveStatus />}
                    </div>
                    {writeAccess && (
                        <Tabs value={activeTab} onValueChange={handleTabChange} className="overflow-x-auto mb-5">
                            <TabsList className="flex gap-1 justify-start">
                                {tabs.map((tab) => {
                                    if (!(isOwner || isAdmin) && tab.value !== 'items' && tab.value !== 'discussions') {
                                        return null;
                                    }

                                    return (
                                        <TabsTrigger key={tab.value} value={tab.value} className="p-4">
                                            {tab.label}
                                        </TabsTrigger>
                                    );  
                                })}
                            </TabsList>
                        </Tabs>
                    )}
                    <Outlet />
                </div>
            </InventorySocketProvider>
        </InventoryProvider>
    );
}

function AutoSaveStatus() {
    const { isSaving, hasChanges } = useInventoryContext();
    const saved = !hasChanges && !isSaving;

    return (
        <div className="flex gap-2 text-nowrap">
            {isSaving && 
            <span className="flex items-center bg-amber-200 text-amber-900 px-2 py-1 rounded-md text-sm">
                <Spinner className="inline-block w-4 h-4 mr-1" />
                Saving...
            </span>}
            {(hasChanges && !isSaving) && <span className="flex items-center bg-red-200 text-red-900 px-2 py-1 rounded-md text-sm">
                <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                Unsaved changes
            </span>}
            {saved && <span className="flex items-center bg-green-200 text-green-900 px-2 py-1 rounded-md text-sm">
                <Check className="inline-block w-4 h-4 mr-1" />
                All changes saved
            </span>}
        </div>
    );
}