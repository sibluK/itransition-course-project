import { CreateInventorySchema, useCreateInventory, type CreateInventoryData } from "@/hooks/useCreateInventory";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useCategories } from "@/hooks/useCategories";
import { Combobox } from "./combobox";
import type { Category, Tag } from "@/types/models";
import { useDebounce } from 'use-debounce';
import { Autocomplete } from "./autocomplete";
import { useTags } from "@/hooks/useTags";
import { UploadDropzone } from "./upload-dropzone";
import { TagsList } from "./tags-list";
import { Spinner } from "./ui/spinner";
import { useTranslation } from "react-i18next";

interface CreateInventoryFormProps {
    onSuccess: () => void;
}

export default function CreateInventoryForm({ onSuccess }: CreateInventoryFormProps) {
    const { createInventory, isPending } = useCreateInventory();
    const { categories } = useCategories();
    const [tagsSearchInput, setTagsSearchInput] = useState<string>("");
    const [tagsSearch] = useDebounce(tagsSearchInput, 300);
    const { tags } = useTags({ search: tagsSearch });
    const { t } = useTranslation();

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

    const handleDrop = async (acceptedFiles: File[]) => {
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
                            <FormLabel>{t("inv-creation-title-label")}</FormLabel>
                            <FormControl>
                                <Input placeholder={t("inv-creation-title-placeholder")} {...field} />
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
                            <FormLabel>{t("inv-creation-description-label")}</FormLabel>
                            <FormControl>
                                <Textarea placeholder={t("inv-creation-description-placeholder")} {...field} />
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
                            <FormLabel>{t("inv-creation-category-label")}</FormLabel>
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
                            <FormLabel>{t("inv-creation-tags-label")}</FormLabel>
                            <FormControl>
                                <Autocomplete 
                                    suggestions={tags.map((t: Tag) => t.name)}
                                    value={field.value || []}
                                    onChange={(tags) => field.onChange(tags)}
                                    placeholder={t("inv-creation-tags-placeholder")}
                                    search={tagsSearchInput}
                                    onSearchChange={setTagsSearchInput}
                                />
                            </FormControl>
                            {field.value && field.value.length > 0 && (
                                <TagsList
                                    tags={field.value}
                                    handleRemoveTag={handleRemoveTag}
                                />
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
                            <FormLabel>{t("inv-creation-image-label")}</FormLabel>
                            <FormControl>
                                <UploadDropzone
                                    onDrop={handleDrop}
                                    previewUrl={previewUrl}
                                    maxFiles={1}
                                    maxSize={1024 * 1024 * 10}
                                    minSize={1024}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Spinner /> : t("inv-creation-create-button")}
                </Button>
            </form>
        </Form>
    );

}

