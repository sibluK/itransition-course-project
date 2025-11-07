import { useEffect, useState, type FormEvent } from "react";
import { useFields } from "@/hooks/useFields";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Item } from "@/types/models";

interface AddItemForm {
    inventoryId: number;
    item?: Item;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function AddItemForm({ inventoryId, item, trigger, open, onOpenChange }: AddItemForm) {
    const { data: customFields } = useFields({ inventoryId });
    const { createItem, updateItem } = useInventoryItems({ inventoryId });
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [internalOpen, setInternalOpen] = useState(false);

    const isEditing = !!item;
    const isControlled = open !== undefined && onOpenChange !== undefined;
    const sheetOpen = isControlled ? open : internalOpen;

    const enabledFields = customFields?.filter(field => field.isEnabled).sort((a, b) => {
        const typeOrder = ["sl_string", "ml_string", "number", "link", "boolean"];
        const typeA = typeOrder.indexOf(a.fieldType);
        const typeB = typeOrder.indexOf(b.fieldType);
        if (typeA !== typeB) return typeA - typeB;
        return a.displayOrder - b.displayOrder;
    }) || [];

    useEffect(() => {
        if (isEditing && item) {
            const initialData: Record<string, any> = {};
            enabledFields.forEach(field => {
                const columnName = `c_${field.fieldKey}`;
                initialData[field.fieldKey] = item[columnName as keyof typeof item] || "";
            });
            setFormData(initialData);
        } else {
            setFormData({});
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const itemData: Record<string, any> = {};
        enabledFields.forEach(field => {
            itemData[`c_${field.fieldKey}`] = formData[field.fieldKey] || "";
        });

        try {
            if (isEditing && item) {
                await updateItem({ itemId: item.id, updatedData: itemData, version: item.version });
            } else {
                await createItem(itemData);
            }
            handleClose();
        } catch (error) {
            console.error("Error submitting item:", error);
        }
    };

    const handleClose = () => {
        if (isControlled && onOpenChange) {
            onOpenChange(false);
        } else {
            setInternalOpen(false);
        }
        setFormData({});
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (isControlled && onOpenChange) {
            onOpenChange(newOpen);
        } else {
            setInternalOpen(newOpen);
        }
        if (!newOpen) {
            setFormData({});
        }
    };

    return (
        <Sheet open={sheetOpen} onOpenChange={handleOpenChange}>
            {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
            <SheetContent className="flex flex-col">
                <SheetHeader>
                    <SheetTitle>{isEditing ? "Edit Item" : "Add New Item"}</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto space-y-4 pr-2">
                    {enabledFields.map(field => (
                        <div key={field.fieldKey} className="space-y-2">
                            <label>{field.label}</label>
                            <Input
                                value={formData[field.fieldKey] || ""}
                                onChange={(e) => setFormData({ ...formData, [field.fieldKey]: e.target.value })}
                            />
                            <p className="text-sm text-muted-foreground">{field.description}</p>
                        </div>
                    ))}
                    <Button type="submit">{isEditing ? "Update Item" : "Save Item"}</Button>
                </form>
            </SheetContent>
        </Sheet>
    );
}