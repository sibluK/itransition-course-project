import { useInventorySocketContext } from "@/contexts/inventory-socket-provider";
import type { DiscussionPost } from "@/types/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useApiRequest } from "./useApiRequest";

export function useDiscussionPosts(inventoryId: number) {
    const socket = useInventorySocketContext();
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();

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

    const fetchDiscussionPosts = async (): Promise<DiscussionPost[]> => {
        const { data } = await sendRequest<DiscussionPost[]>({
            method: "GET",
            url: `/discussions/inventories/${inventoryId}/posts`
        });
        return data ?? [];
    };

    const createDiscussionPost = async (content: string): Promise<void> => {
        await sendRequest<void>({
            method: "POST",
            url: `/discussions/inventories/${inventoryId}/posts`,
            body: { content }
        });
    };

    const deleteDiscussionPost = async (postId: number): Promise<void> => {
        await sendRequest<void>({
            method: "DELETE",
            url: `/discussions/inventories/${inventoryId}/posts/${postId}`
        });
    };

    const { data, isLoading, error } = useQuery({
        queryKey: ["discussionPosts", { inventoryId }],
        queryFn: fetchDiscussionPosts,
        staleTime: 1 * 60 * 1000
    });

    // No need to handle on success to set the query data
    // The new post gets added when sent via socket
    const { mutateAsync: addDiscussionPost } = useMutation({
        mutationFn: createDiscussionPost
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
    };
}