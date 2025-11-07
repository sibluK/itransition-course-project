import { Combobox } from "@/components/combobox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useInventoryContext } from "@/contexts/inventory-provider";
import { useCategories } from "@/hooks/useCategories";
import type { Category, Tag } from "@/types/models";
import { UploadDropzone } from "@/components/upload-dropzone";
import { useTags } from "@/hooks/useTags";
import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Autocomplete } from "@/components/autocomplete";
import { TagsList } from "@/components/tags-list";

export default function Settings() {
    const { data, updateData, uploadImage } = useInventoryContext();
    const { categories } = useCategories();
    const [tagsSearchInput, setTagsSearchInput] = useState<string>("");
    const [tagsSearch] = useDebounce(tagsSearchInput, 300);
    const { tags } = useTags({ search: tagsSearch });

    const handleDrop = async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            await uploadImage(file);
        }
    }

    const handleAddTag = (tagToAdd: string) => {
        if (data.tags.find((tag) => tag === tagToAdd)) {
            return;
        }
        const updatedTags = [...data.tags, tagToAdd];
        updateData({ tags: updatedTags });
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = data.tags.filter((tag) => tag !== tagToRemove);
        updateData({ tags: updatedTags });
    }

    return (
        <div className="mx-3 mt-5 w-full">
            <div className="w-full max-w-4xl">
                <FieldSet>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldContent>
                                <FieldLabel>Title</FieldLabel>
                                <FieldDescription>The title of the inventory.</FieldDescription>
                            </FieldContent>
                            <Input 
                                id="title" 
                                placeholder="Title"
                                className="sm:min-w-[300px]"
                                value={data.title} 
                                onChange={(e) => updateData({ title: e.target.value })}
                            />
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldContent>
                                <FieldLabel>Description</FieldLabel>
                                <FieldDescription>The description of the inventory.</FieldDescription>
                            </FieldContent>
                            <Textarea
                                id="description" 
                                placeholder="Description"
                                className="min-h-[100px] resize-y sm:min-w-[300px]" 
                                value={data.description || ""} 
                                onChange={(e) => updateData({ description: e.target.value })}
                            />
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldContent>
                                <FieldLabel>Category</FieldLabel>
                                <FieldDescription>The category of the inventory.</FieldDescription>
                            </FieldContent>
                            <Combobox 
                                data={categories.map((c: Category) => ({ label: c.name, value: c.id.toString() }))}
                                value={data.categoryId?.toString() || ""}
                                onChange={(val) => 
                                    updateData({ categoryId: val === "" ? undefined : Number(val) })
                                }
                                classname="sm:min-w-[300px]"
                            />  
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field orientation="responsive" className="flex flex-wrap">
                            <FieldContent>
                                <FieldLabel>Tags</FieldLabel>
                                <FieldDescription>The tags associated with the inventory.</FieldDescription>
                            </FieldContent>
                            <div className="flex flex-wrap max-w-[400px]">
                                <Autocomplete 
                                    suggestions={tags.map((t: Tag) => t.name)}
                                    value={tags.map(t => t.name)}
                                    onChange={(tags) => tags.forEach(handleAddTag)}
                                    placeholder="Add tags..."
                                    search={tagsSearchInput}
                                    onSearchChange={setTagsSearchInput}
                                />
                                <TagsList 
                                    tags={data.tags || []}
                                    handleRemoveTag={handleRemoveTag}
                                />
                            </div>
                        </Field>
                    </FieldGroup>
                    <FieldGroup>
                        <Field orientation="responsive">
                            <FieldContent>
                                <FieldLabel>Image</FieldLabel>
                                <FieldDescription>The image URL of the inventory.</FieldDescription>
                            </FieldContent>
                            <UploadDropzone
                                onDrop={handleDrop}
                                classname="w-100 p-2 m-0"
                                previewUrl={data.image_url}
                                maxFiles={1}
                                maxSize={1024 * 1024 * 10}
                                minSize={1024}
                            />
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </div>
        </div>
    );
}