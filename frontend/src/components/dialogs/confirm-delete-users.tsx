import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface ConfirmDeleteUsersDialogProps {
    isDeleteDialogOpen: boolean;
    setIsDeleteDialogOpen: (open: boolean) => void;
    selectedCount: number;
    handleDeleteConfirm: () => void;
}

export default function ConfirmDeleteUsersDialog({ isDeleteDialogOpen, setIsDeleteDialogOpen, selectedCount, handleDeleteConfirm }: ConfirmDeleteUsersDialogProps) {
    const { t } = useTranslation();
    return (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t('default_confirm_message')}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t('default_confirm_message_2')} {t('confirm_delete_selected_users', { count: selectedCount })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteConfirm}>{t('delete')}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}