import { createContext, useContext, useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import type { InventoryUpdatePayload } from "@/types/models";
import { useInventory } from "@/hooks/useInventory";

interface InventoryProviderProps {
    children: React.ReactNode;
    initialData: InventoryUpdatePayload;
    inventoryId: number;
    writeAccess: boolean;
}

const InventoryContext = createContext<{
    data: InventoryUpdatePayload;
    updateData: (newData: Partial<InventoryUpdatePayload>) => void;
    uploadImage: ({ imageFile, version }: { imageFile: File, version: number }) => void;
    isSaving: boolean;
    hasChanges: boolean;
    writeAccess: boolean;
} | null>(null);

export function InventoryProvider({ children, initialData, inventoryId, writeAccess }: InventoryProviderProps) {
    const { saveInventory, isPending, uploadImage } = useInventory({ inventoryId });

    const [data, setData] = useState<InventoryUpdatePayload>(() => ({
        ...initialData, 
        tags: initialData.tags || []
    }));
    const [hasChanges, setHasChanges] = useState(false);
    const [value] = useDebounce(data, 1000);

    useEffect(() => {
        if (initialData.version !== data.version) {
            setData({ ...initialData, tags: initialData.tags || [] });
            setHasChanges(false);
        }
    }, [initialData]);

    const updateData = (updates: Partial<InventoryUpdatePayload>) => {
        setData((prev) => ({ ...prev, ...updates}))
        setHasChanges(true);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (hasChanges && !isPending) {
                saveInventory(value);
            }
        }, 8000)

        return () => clearInterval(interval);
    }, [value, hasChanges, isPending, saveInventory]);

    return (
        <InventoryContext.Provider value={{ data, updateData, uploadImage, isSaving: isPending, hasChanges, writeAccess }}>
            {children}
        </InventoryContext.Provider>
    );
}

export const useInventoryContext = () => {
    const context =  useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventoryContext must be used within an InventoryProvider");
    }
    return context;
}