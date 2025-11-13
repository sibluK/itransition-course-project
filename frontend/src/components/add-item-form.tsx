import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useFields } from "@/hooks/useFields";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FieldType, Item } from "@/types/models";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";

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

    const enabledFields = useMemo(() => {
        if (!customFields) return [];
        
        return customFields
            .filter(field => field.isEnabled)
            .sort((a, b) => {
                const typeOrder = ["sl_string", "ml_string", "number", "link", "boolean"];
                const typeA = typeOrder.indexOf(a.fieldType);
                const typeB = typeOrder.indexOf(b.fieldType);
                if (typeA !== typeB) return typeA - typeB;
                return a.displayOrder - b.displayOrder;
            });
    }, [customFields]);

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
    }, [item, isEditing, enabledFields, sheetOpen]);

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
        } catch (error: any) {
            console.error("Error submitting item:", error);

            if (error.status === 409) {
                handleClose();
            }
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
                    <SheetTitle>{isEditing ? "Edit Item" : "Add Item"}</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col overflow-y-auto gap-4">
                    {enabledFields.map(field => (
                        <div key={field.fieldKey} className="flex flex-col gap-1">
                            <label>{field.label}</label>
                            <InputField 
                                fieldType={field.fieldType}
                                value={formData[field.fieldKey]}
                                onChange={(value: string | boolean) => setFormData({ ...formData, [field.fieldKey]: value })}
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

interface InputFieldProps {
    fieldType: FieldType;
    value: string;
    onChange: (value: string | boolean) => void;
}

function InputField({ fieldType, value, onChange }: InputFieldProps) {
    switch (fieldType) {
        case "sl_string":
            return (
                <Input
                    placeholder="Enter text..."
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "ml_string":
            return (
                <Textarea
                    placeholder="Enter text..."
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                    className=""
                />
            );
        case "number":  
            return (
                <Input
                    placeholder="Enter a number..."
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "link":
            return (
                <Input
                    placeholder="Enter a URL..."
                    value={value || ""}
                    onChange={(e) => onChange(e.target.value)}
                />
            );
        case "boolean":
            return (
                <Switch 
                    checked={!!value}
                    onCheckedChange={(checked) => onChange(checked)}
                />
            );
        default:
            return null;
    }
}