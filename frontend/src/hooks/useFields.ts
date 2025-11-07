import type { CustomField } from "@/types/models";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest";

interface UseFieldsProps {
    inventoryId: number;
}

export function useFields({ inventoryId }: UseFieldsProps) {
    const { sendRequest } = useApiRequest();

    const fetchInventoryFields = async (): Promise<CustomField[]> => {
        const { data } = await sendRequest<CustomField[]>({
            method: "GET",
            url: `/fields/${inventoryId}`
        });
        return data ?? [];
    };

    const updateInventoryFields = async (updates: Partial<CustomField>[]): Promise<void> => {
        await sendRequest({
            method: "PATCH",
            url: `/fields/${inventoryId}`,
            body: updates
        });
    };

    const { data, error, isLoading } = useQuery({
        queryKey: ["customFields", { inventoryId }],
        queryFn: fetchInventoryFields,
        enabled: !!inventoryId,
        staleTime: 5 * 60 * 1000
    });

    const { mutateAsync: saveFields } = useMutation({
        mutationFn: updateInventoryFields
    });

    return { data, error, isLoading, saveFields };
}