import { FieldSet, FieldGroup, Field, FieldContent, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAccessTable } from "@/components/user-access-table";
import { useInventoryContext } from "@/contexts/inventory-provider";
import { useInventoryAccess } from "@/hooks/useInventoryAccess";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useDebounce } from "use-debounce";

export default function Access() {
    const { data: inventory, updateData } = useInventoryContext();
    const [search, setSearch] = useState("");
    const [value] = useDebounce(search, 400);
    const { t } = useTranslation();
    const { 
        usersWithWriteAccess, 
        addUserToWriteAccess, 
        removeUsersFromWriteAccess 
    } = useInventoryAccess({ inventoryId: inventory.id, search: value });

    const handleValueChange = (value: string) => {
        updateData({ isPublic: value === "public" });
    };

    const handleAddUserToWriteAccess = async (userId: string) => {
        toast.promise(
            addUserToWriteAccess({ userId, inventoryId: inventory.id }),
            {
                loading: "Adding user to write access...",
                success: "User added to write access",
                error: "Failed to add user to write access",
            }
        );
    };

    const handleRemoveUsersFromWriteAccess = async (userIds: string[]) => {
        toast.promise(
            removeUsersFromWriteAccess({ userIds, inventoryId: inventory.id }),
            {
                loading: "Removing users from write access...",
                success: "Users removed from write access",
                error: "Failed to remove users from write access",
            }
        );
    };

    return (
        <div className="max-w-5xl">
            <div className="w-full mb-5">
                <FieldSet>
                    <FieldGroup className="flex items-center">
                        <Field orientation="responsive">
                            <FieldContent>
                                <FieldLabel>{t("access-selection-label")}</FieldLabel>
                                <FieldDescription className="text-sm max-w-[500px]">{t("access-selection-description")}</FieldDescription>
                            </FieldContent>
                            <Select
                                value={inventory.isPublic ? "public" : "private"}
                                onValueChange={handleValueChange}
                            >
                                <SelectTrigger className="w-full sm:w-auto">
                                    <SelectValue placeholder="Select access level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="public">{t("select-public")}</SelectItem>
                                    <SelectItem value="private">{t("select-private")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                </FieldSet>
            </div>
            {!inventory.isPublic && (
                <UserAccessTable 
                    data={usersWithWriteAccess || []} 
                    search={search}
                    setSearch={setSearch}
                    addUserToWriteAccess={handleAddUserToWriteAccess}
                    removeUsersFromWriteAccess={handleRemoveUsersFromWriteAccess}
                />
            )}
            
        </div>
    );
}