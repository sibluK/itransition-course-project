import CreateInventoryForm from "@/components/create-inventory-form";
import { InventoriesTable } from "@/components/inventories-table";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useUserInventories } from "@/hooks/useUserInventories";
import { Plus } from "lucide-react";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Inventories() {
    const { inventories, isLoading, error } = useUserInventories();
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { t } = useTranslation();

    const handleCreationSuccess = () => {
        setIsSheetOpen(false);
    }

    return (
        <div>
            {error && <p>Error loading inventories: {String(error)}</p>}
            <div className="flex justify-around flex-wrap gap-10">
                <div className="flex-1">
                    <div className="flex justify-between">
                        <h1 className="text-2xl font-bold mb-4">{t("my-inventories-created-header")}</h1>
                        <InventoryCreationSheet
                            isOpen={isSheetOpen}
                            onClose={setIsSheetOpen}
                            onSuccess={handleCreationSuccess}
                        />
                    </div>
                    <InventoriesTable data={inventories.ownedInventories} loading={isLoading}/>
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold mb-4">{t("my-inventories-write-access-header")}</h1>
                    <InventoriesTable data={inventories.writeAccessInventories} loading={isLoading}/>
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
                    <SheetTitle>{t("inv-creation-header-label")}</SheetTitle>
                    <SheetDescription className="mb-4">
                        {t("inv-creation-info")}
                    </SheetDescription>
                </SheetHeader>
                <CreateInventoryForm onSuccess={onSuccess} />
            </SheetContent>
        </Sheet>
    );
}