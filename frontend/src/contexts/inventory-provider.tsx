import { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { useApiRequest } from "@/hooks/useApiRequest";

interface InventoryProviderProps {
    children: React.ReactNode;
    initialData: InventoryUpdatePayload;
    inventoryId: number;
    writeAccess: boolean;
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
    uploadImage: (imageFile: File) => void;
    isSaving: boolean;
    hasChanges: boolean;
    writeAccess: boolean;
} | null>(null);

export function InventoryProvider({ children, initialData, inventoryId, writeAccess }: InventoryProviderProps) {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();

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

    const sendUpdateRequest = async (updates: Partial<InventoryUpdatePayload>) => {
        const { data: responseData, code } = await sendRequest<InventoryUpdatePayload>({
            method: "PATCH",
            url: `/inventories/${inventoryId}`,
            body: updates
        });

        if (code !== 200 || !responseData) {
            throw { 
                status: code, 
                message: 'Failed to update inventory' 
            };
        }

        return responseData;
    };

    const sendUpdateImage = async (imageFile: File) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("version", String(data.version));

        const { data: responseData, code } = await sendRequest<InventoryUpdatePayload>({
            method: "PATCH",
            url: `/inventories/${inventoryId}`,
            formData
        });

        if (code !== 200 || !responseData) {
            throw { 
                status: code, 
                message: 'Failed to upload image' 
            };
        }

        return responseData;
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
            } else {
                toast("Unable to save changes", {
                    description: "Something went wrong. Plasee reset the inventory information changes",
                    action: {
                        label: "Reset",
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