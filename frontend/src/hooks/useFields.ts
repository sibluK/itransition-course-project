import { useMutation, useQuery } from "@tanstack/react-query";

interface UseFieldsProps {
    inventoryId: number;
}

export function useFields({ inventoryId }: UseFieldsProps) {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const fetchInventoryFields = async () => {
        if (!inventoryId) return [];
        const response = await fetch(`${API_URL}/fields/${inventoryId}`, {
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch custom fields");
        }
        const data = await response.json();
        return data;
    };

    const updateInventoryFields = async (updates: any[]) => {
        const response = await fetch(`${API_URL}/fields/${inventoryId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(updates),
        });
        if (!response.ok) {
            throw new Error("Failed to update custom fields");
        }
        const data = await response.json();
        return data;
    }

    const { data, error, isLoading } = useQuery({
        queryKey: ["customFields", { inventoryId }],
        queryFn: fetchInventoryFields,
        enabled: !!inventoryId,
    });

    const { mutateAsync: saveFields } = useMutation({
        mutationFn: updateInventoryFields,
    })

    return { data, error, isLoading, saveFields };
}