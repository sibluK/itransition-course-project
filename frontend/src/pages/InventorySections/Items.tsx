import { ItemsTable } from "@/components/items-table";
import { useFields } from "@/hooks/useFields";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import type { Item } from "@/types/models";
import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";
import { useParams } from "react-router";
import { Spinner } from "@/components/ui/spinner";
import { useState } from "react";
import { AddItemForm } from "@/components/add-item-form";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useInventoryContext } from "@/contexts/inventory-provider";
import { useAuth } from "@clerk/clerk-react";

export default function Items() {
    const { inventoryId } = useParams();
    const { items } = useInventoryItems({ inventoryId: Number(inventoryId) });
    const { data: customFields } = useFields({ inventoryId: Number(inventoryId) });
    const [editingItem, setEditingItem] = useState<Item | null>(null);
    const { writeAccess } = useInventoryContext();
    const { isSignedIn } = useAuth();

    if (!inventoryId) {
        return <Spinner />
    }

    const typeOrder = ["sl_string", "ml_string", "number", "link", "boolean"];

    const enabledFields = customFields?.filter(field => field.isEnabled).sort((a, b) => {
        const typeA = typeOrder.indexOf(a.fieldType);
        const typeB = typeOrder.indexOf(b.fieldType);
        if (typeA !== typeB) return typeA - typeB;
        return a.displayOrder - b.displayOrder;
    }) || [];

    const columns: ColumnDef<Item>[] = [];

    if (writeAccess && isSignedIn) {
        columns.push({
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
        });
    }

    columns.push(...enabledFields.map((field) => ({
        accessorKey: `c_${field.fieldKey}`,
        header: field.label
    })));

    if (writeAccess && isSignedIn) {
        columns.push({
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => <ActionDropdown item={row.original} onEdit={setEditingItem} />,
        });
    }
  
    return (
        <div>
            <ItemsTable 
                data={items}
                columns={columns}
                inventoryId={Number(inventoryId)}
            />
            <AddItemForm 
                inventoryId={Number(inventoryId)} 
                item={editingItem ?? undefined}
                open={!!editingItem}
                onOpenChange={(open) => !open && setEditingItem(null)}
            />
        </div>
    );
}

const ActionDropdown = ({ item, onEdit }: { item: Item, onEdit: (item: Item | null) => void}) => {
    const { t } = useTranslation();
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(item)}>
                    {t?.('button-edit')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};