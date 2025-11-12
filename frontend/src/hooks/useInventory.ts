import type { Inventory, InventoryUpdatePayload, Tag } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";
import { toast } from "sonner";

interface UseInventoryProps {
    inventoryId: number;
}

interface InventoryResponse {
    inventory: Inventory;
    tags: Tag[];
    writeAccess: boolean;
}

export function useInventory({ inventoryId }: UseInventoryProps) {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();
    
    const fetchInventory = async (): Promise<InventoryResponse | null> => {
        const { data } = await sendRequest<InventoryResponse>({
            method: "GET",
            url: `/inventories/${inventoryId}`,
        });
        return data;
    }

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

    const sendUpdateImage = async ({ imageFile, version}: { imageFile: File, version: number }) => {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("version", String(version));

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

    const deleteInventory = async (): Promise<void> => {
        await sendRequest({
            method: "DELETE",
            url: `/inventories/${inventoryId}`
        });
    }

    const { data, isLoading, error } = useQuery<InventoryResponse | null>({
        queryKey: ['inventory', { inventoryId }],
        queryFn: fetchInventory,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnMount: false
    });

    const { mutateAsync: saveInventory, isPending } = useMutation({
        mutationFn: sendUpdateRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory", { inventoryId }]})
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["inventory", { inventoryId }]})
            toast.success("Image uploaded successfully");
        },
        onError: () => {
            toast.error("Failed to upload image");
        }
    });

    const { mutateAsync: deleteInventoryMutation } = useMutation({
        mutationFn: deleteInventory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
    });

    return {
        inventory: data?.inventory,
        tags: data?.tags || [],
        writeAccess: data?.writeAccess || false,
        isLoading,
        error,
        saveInventory,
        isPending,
        uploadImage,
        deleteInventory: deleteInventoryMutation,
    };
}