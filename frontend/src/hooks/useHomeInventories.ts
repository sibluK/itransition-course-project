import type { HomeInventoriesResponse } from "@/types/models";
import { useApiRequest } from "./useApiRequest";
import { useQuery } from "@tanstack/react-query";

export function useHomeInventories() {
    const { sendRequest } = useApiRequest();
    
    const fetchInventories = async () => {
        const { data } = await sendRequest<HomeInventoriesResponse>({
            method: "GET",
            url: "/inventories/home"
        });
        return data;
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["home-inventories"],
        queryFn: fetchInventories,
        staleTime: 5 * 60 * 1000
    });

    return { data, isLoading, error };
}