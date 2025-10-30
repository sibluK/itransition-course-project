import CreateInventoryForm from "@/components/create-inventory-form";
import { InventoriesTable } from "@/components/inventories-table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUserInventories } from "@/hooks/useUserInventories";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Inventories() {
    const { inventories, isLoading, error, refetch } = useUserInventories();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const handleCreationSuccess = () => {
        setIsSheetOpen(false);
        refetch();
    }

    return (
        <div>
            {isLoading && <p>Loading inventories...</p>}
            {error && <p>Error loading inventories: {String(error)}</p>}
            <div className="flex justify-around flex-wrap gap-10">
                <div className="flex-1">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">Personal Inventories</h1>
                        <InventoryCreationSheet
                            isOpen={isSheetOpen}
                            onClose={setIsSheetOpen}
                            onSuccess={handleCreationSuccess}
                        />
                    </div>
                    <InventoriesTable data={inventories.ownedInventories} />
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">Write Access</h1>
                    <InventoriesTable data={inventories.writeAccessInventories} />
                </div>
            </div>
        </div>
    );
}

interface InventoryCreationSheetProps {
    isOpen: boolean;
    onClose: React.Dispatch<React.SetStateAction<boolean>>;
    onSuccess: () => void;
}

function InventoryCreationSheet({ isOpen, onClose, onSuccess }: InventoryCreationSheetProps) {
    const { t } = useTranslation(); 
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetTrigger asChild>
                <Button>
                    <Plus />
                    {t('new_inventory')}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Create a new inventory</SheetTitle>
                    <SheetDescription className="mb-4">
                        Fill in the details below to create a new inventory.
                    </SheetDescription>
                </SheetHeader>
                <CreateInventoryForm onSuccess={onSuccess} />
            </SheetContent>
        </Sheet>
    );
}