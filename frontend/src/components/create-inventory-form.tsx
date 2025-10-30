import { CreateInventorySchema, useCreateInventory, type CreateInventoryData } from "@/hooks/useCreateInventory";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Combobox } from "./combobox";
import type { Category, Tag } from "@/types/models";
import { useDebounce } from 'use-debounce';
import { Autocomplete } from "./autocomplete";
import { useTags } from "@/hooks/useTags";

interface CreateInventoryFormProps {
    onSuccess: () => void;
}

export default function CreateInventoryForm({ onSuccess }: CreateInventoryFormProps) {
    const { createInventory, isPending } = useCreateInventory();
    const { categories } = useCategories();
    const [tagsSearchInput, setTagsSearchInput] = useState<string>("");
    const [tagsSearch] = useDebounce(tagsSearchInput, 300);
    const { tags } = useTags({ search: tagsSearch });

    const defaultValues: CreateInventoryData = {
        title: "",
        description: "",
        categoryId: undefined,
        tags: [],
        image: undefined,
    }

    const form = useForm<CreateInventoryData>({
        resolver: zodResolver(CreateInventorySchema) as unknown as Resolver<CreateInventoryData>,
        defaultValues,
    });

    const watchedImage = form.watch("image") as File | undefined;
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (watchedImage) {
            const url = URL.createObjectURL(watchedImage);
            setPreviewUrl(url);
            return () => {
                URL.revokeObjectURL(url);
                setPreviewUrl(null);
            };
        } else {
            setPreviewUrl(null);
        }
    }, [watchedImage]);

    const onSubmit = async (data: CreateInventoryData) => {
        await createInventory(data);
        onSuccess();
    }

    const handleDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            form.setValue("image", file, { shouldValidate: true, shouldDirty: true });
        }
    }

    const handleRemoveTag = (tagName: string) => {
        const currentTags = form.getValues("tags");
        const updatedTags = currentTags.filter(tag => tag !== tagName);
        form.setValue("tags", updatedTags, { shouldValidate: true });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder="Inventory Title" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="A brief description..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                                <Combobox 
                                    data={categories.map((c: Category) => {
                                    return { value: c.id.toString(), label: c.name };
                                })} 
                                    value={field.value?.toString() || ""} 
                                    onChange={(val: string) =>
                                        field.onChange(val === "" ? undefined : Number(val))
                                    }
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                                <Autocomplete 
                                    suggestions={tags.map((t: Tag) => t.name)}
                                    value={field.value || []}
                                    onChange={(tags) => field.onChange(tags)}
                                    placeholder="Add tags..."
                                    search={tagsSearchInput}
                                    onSearchChange={setTagsSearchInput}
                                />
                            </FormControl>
                            {field.value && field.value.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {field.value.map((tagName) => (
                                        <span
                                            key={tagName}
                                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
                                            onClick={() => handleRemoveTag(tagName)}
                                        >
                                            {tagName}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <FormMessage />
                        </FormItem>
                    )}
                >
                </FormField>
                <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                        <FormItem>
                            <FormLabel>Image</FormLabel>
                            <FormControl>
                                <Dropzone
                                    accept={{ 'image/jpeg': [], 'image/png': [] }}
                                    maxFiles={1}
                                    maxSize={1024 * 1024 * 10}
                                    minSize={1024}
                                    onDrop={handleDrop}
                                    onError={console.error}
                                >
                                    {previewUrl ? (
                                        <div className="p-2">
                                            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-md" />
                                        </div>
                                    ) : (
                                        <>
                                            <DropzoneEmptyState />
                                            <DropzoneContent />
                                        </>
                                    )}
                                </Dropzone>
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create Inventory'}
                </Button>
            </form>
        </Form>
    );

}

