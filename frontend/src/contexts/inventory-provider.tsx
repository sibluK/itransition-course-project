import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";

interface InventoryProviderProps {
    children: React.ReactNode;
    initialData: InventoryUpdatePayload;
    inventoryId: number;
}

interface InventoryUpdatePayload {
    id: number;
    version: number;
    image_url?: string;
    title: string;
    description?: string;
    categoryId?: number;
    isPublic: boolean;
    tags: string[];
}

const InventoryContext = createContext<{
    data: InventoryUpdatePayload;
    updateData: (newData: Partial<InventoryUpdatePayload>) => void;
    uploadImage: (imageFile: File) => Promise<void>;
    isSaving: boolean;
    hasChanges: boolean;
} | null>(null);

export function InventoryProvider({ children, initialData, inventoryId }: InventoryProviderProps) {
    const [data, setData] = useState<InventoryUpdatePayload>({...initialData, tags: initialData.tags || []});
    const [hasChanges, setHasChanges] = useState(false);
    const queryClient = useQueryClient();
    const [value] = useDebounce(data, 1000);
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const sendUpdateRequest = async (updates: Partial<InventoryUpdatePayload>) => {
        const response = await fetch(`${API_URL}/inventories/${inventoryId}`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates)
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw { status: response.status, message: errorData.error || 'Failed to update inventory' };
        }
        return response.json();
    }

    const sendUpdateImage = async (imageFile: File) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("version", String(data.version));

        const response = await fetch(`${API_URL}/inventories/${inventoryId}`, {
            method: "PATCH",
            credentials: "include",
            body: formData,
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw { status: response.status, message: errorData.error || 'Failed to upload image' };
        }
        return response.json();
    };

    const updateData = (updates: Partial<InventoryUpdatePayload>) => {
        setData((prev) => ({ ...prev, ...updates}))
        setHasChanges(true);
    };

    const { mutateAsync: saveInventory, isPending } = useMutation({
        mutationFn: sendUpdateRequest,
        onSuccess: (updatedInventory) => {
            setData(updatedInventory);
            queryClient.invalidateQueries({ queryKey: ["inventory", { inventoryId }]})
            setHasChanges(false);
            toast.success("Inventory saved!")
        },
        onError: (error: any) => {
            console.log(error)
            if (error.status === 409) {
                toast("Version Conflict", {
                    description: "Another user has modified this inventory. Please refresh to get the latest data.",
                    action: {
                        label: "Refresh",
                        onClick: () => queryClient.invalidateQueries({ queryKey: ["inventory", { inventoryId }]})
                    }
                })
            }
        }
    });

    const { mutateAsync: uploadImage } = useMutation({
        mutationFn: sendUpdateImage,
        onSuccess: (data) => {
            updateData(data);
            toast.success("Image uploaded successfully");
        },
        onError: () => {
            toast.error("Failed to upload image");
        }
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (hasChanges && !isPending) {
                saveInventory(value);
            }
        }, 8000)

        return () => clearInterval(interval);
    }, [value, hasChanges, isPending, saveInventory]);

    useEffect(() => {
        setData(initialData);
        setHasChanges(false);
    }, [initialData]);

    return (
        <InventoryContext.Provider value={{ data, updateData, uploadImage, isSaving: isPending, hasChanges }}>
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