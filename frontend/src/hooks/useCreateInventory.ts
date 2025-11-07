import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useApiRequest } from "./useApiRequest";

export const CreateInventorySchema = z.object({
    title: z
        .string()
        .min(1, "Title must be at least 1 character")
        .max(255, "Title must be at most 255 characters"),
    description: z
        .string()
        .max(1024, "Description must be at most 1024 characters")
        .optional(),
    categoryId: z
        .number()
        .optional(),
    tags: z
        .array(z.string())
        .default([]),
    image: z
        .instanceof(File)
        .optional()
        .refine((file) => {
            if (!file) return true;
            const validTypes = ["image/jpeg", "image/png"];
            return validTypes.includes(file.type);
        }, { message: "Invalid image type" }),
});

export type CreateInventoryData = z.infer<typeof CreateInventorySchema>;

export function useCreateInventory() {
    const queryClient = useQueryClient();
    const { sendRequest } = useApiRequest();

    const createInventory = async (data: CreateInventoryData): Promise<void> => {
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        if (data.categoryId) formData.append('categoryId', data.categoryId.toString());
        if (data.image) formData.append('image', data.image);
        data.tags.forEach(tag => formData.append('tags[]', tag));
        await sendRequest({
            method: "POST",
            url: "/inventories",
            formData: formData
        });
    }

    const { mutateAsync: createInventoryMutation, isPending, error } = useMutation({
        mutationFn: createInventory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
    })

    return {
        createInventory: createInventoryMutation,
        isPending,
        error
    };
}