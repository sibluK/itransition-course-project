import { useQuery } from "@tanstack/react-query";
import { useApiRequest } from "./useApiRequest"

interface ApiKeyResponse {
    apiToken: string;
}

export function useApiKey(inventoryId: number) {
    if (!inventoryId)
        return {
            apiKey: "",
            isLoading: false,
            error: null,
            refetchApiKey: () => { },
        };

    const { sendRequest } = useApiRequest();

    const fetchApiKey = async (): Promise<ApiKeyResponse> => {
        const { data } = await sendRequest<ApiKeyResponse>({
            url: `/inventories/${inventoryId}/api-token`,
            method: 'GET',
        });
        return data || { apiToken: '' };
    }

    const { data, isLoading, error, refetch, isRefetching } = useQuery({
        queryKey: ['inventory-api-key', { inventoryId }],
        queryFn: fetchApiKey,
        enabled: !!inventoryId,
        refetchOnWindowFocus: false
    });

    return {
        apiKey: data?.apiToken || "",
        isLoading,
        isRefetching,
        error,
        refetchApiKey: refetch,
    };
}