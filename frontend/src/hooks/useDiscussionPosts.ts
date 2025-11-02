import { useInventorySocketContext } from "@/contexts/inventory-socket-provider";
import type { DiscussionPost } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useDiscussionPosts(inventoryId: number) {
    const socket = useInventorySocketContext();
    const queryClient = useQueryClient();
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        if (!socket) return;

        const handleNewPost = (post: DiscussionPost) => {
            queryClient.setQueryData<DiscussionPost[]>(["discussionPosts", { inventoryId }], (oldPosts) => {
                if (!oldPosts) return [post];
                return [...oldPosts, post];
            });
        }

        socket.on("new_post", handleNewPost);

        return () => {
            socket.off("new_post", handleNewPost);
        }
    }, [socket, inventoryId, queryClient]);

    const fetchDiscussionPosts = async () => {
        const response = await fetch(`${API_URL}/discussions/inventories/${inventoryId}/posts`, {
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to fetch discussion posts");
        }
        return response.json();
    };

    const createDiscussionPost = async (content: string) => {
        const response = await fetch(`${API_URL}/discussions/inventories/${inventoryId}/posts`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            throw new Error("Failed to create discussion post");
        }
        return response.json();
    };

    const deleteDiscussionPost = async (postId: number) => {
        const response = await fetch(`${API_URL}/discussions/inventories/${inventoryId}/posts/${postId}`, {
            method: "DELETE",
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error("Failed to delete discussion post");
        }
    }

    const { data, isLoading, error } = useQuery<DiscussionPost[]>({
        queryKey: ["discussionPosts", { inventoryId }],
        queryFn: fetchDiscussionPosts,
    });

    const { mutateAsync: addDiscussionPost } = useMutation({
        mutationFn: createDiscussionPost,
    });

    const { mutateAsync: removeDiscussionPost } = useMutation({
        mutationFn: deleteDiscussionPost,
        onSuccess: (_: any, postId: number) => {
            queryClient.setQueryData<DiscussionPost[]>(["discussionPosts", { inventoryId }], (oldPosts) => {
                if (!oldPosts) return [];
                const newPosts = oldPosts?.filter(post => post.id !== postId) || [];
                return newPosts;
            });
        }
    });

    return {
        data,
        isLoading,
        error,
        addDiscussionPost,
        removeDiscussionPost,
    }
}