import { useAuth } from "@clerk/clerk-react";

interface ApiRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    body?: any;
    headers?: Record<string, string>;
    requiresAuth?: boolean;
    formData?: FormData;
}

export function useApiRequest() {
    const API_URL = import.meta.env.VITE_BACKEND_URL;
    const { getToken } = useAuth(); 

    const sendRequest = async <TResponse>({
        method,
        url,
        body,
        headers = {},
        requiresAuth = true,
        formData
    }: ApiRequestOptions): Promise<{ data: TResponse | null, code: number }> => {
        const defaultHeaders: Record<string, string> = {};

        if (!formData) {
            defaultHeaders["Content-Type"] = "application/json";
        }

        if (requiresAuth) {
            const token = await getToken();
            if (token) {
                defaultHeaders["Authorization"] = `Bearer ${token}`;
            }
        }

        try {
            const response = await fetch(`${API_URL}${url}`, {
                method,
                headers: {
                    ...defaultHeaders,
                    ...headers
                },
                body: formData ? formData : body ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error(`HTTP ${response.status}: ${response.statusText}`, errorData);
                return { data: null, code: response.status };
            }

            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data: TResponse = await response.json();
                return { data, code: response.status };
            } else {
                return { data: null, code: response.status };
            }
        } catch (error) {
            console.error("API request failed:", error);
            return { data: null, code: 0}
        }
    }

    return { sendRequest };
}
