import type { ColumnDef, SortingState, ColumnFiltersState, Table as TableType, CellContext } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Lock, Unlock, Trash } from "lucide-react"
import { useTranslation } from "react-i18next";
import type { User } from "@/types/models";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"

import { Button } from "@/components/ui/button";
import { Input } from  "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useState } from "react";
import { uppercaseFirstLetter } from "@/lib/utils";
import { useNavigate } from "react-router";
import ConfirmDeleteUsersDialog from "./dialogs/confirm-delete-users";

interface DataTableProps {
    data: User[];
    updateUsersStatus: (params: { userIds: string[], action: 'ban' | 'unban' }) => Promise<any>;
    updateUsersRole: (params: { userIds: string[], newRole: string }) => Promise<any>;
    deleteUsers: (userIds: string[]) => Promise<any>;
}

export function UsersTable({ data, updateUsersRole, updateUsersStatus, deleteUsers }: DataTableProps) {
    const { i18n, t } = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const columns: ColumnDef<User>[] = [
        {
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
        },
        {
            accessorKey: 'imageUrl',
            header: t('avatar'),
            cell: info => <img src={info.getValue<string>()} alt="User Avatar" className="w-8 h-8 rounded-full" />,
        },
        {
            accessorKey: 'name',
            header: t('name'),
        },
        {
            accessorKey: 'email',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('email')}
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                );
            },
        },
        {
            accessorKey: 'role',
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        {t('role')}
                        <ArrowUpDown className="h-4 w-4" />
                    </Button>
                );
            },
            cell: info => t(info.getValue<string>())
        },
        {
            accessorKey: 'joinedAt',
            header: t('joined_at'),
            cell: info => info.getValue<Date>().toLocaleDateString(i18n.language),
        },
        {
            accessorKey: 'lastLogin',
            header: t('last_login'),
            cell: info => info.getValue<Date>().toLocaleDateString(i18n.language),
        },
        {
            accessorKey: 'status',
            header: t('status'),
            cell: info => t(info.getValue<string>()),
        },
        {
            id: 'actions',
            header: t('actions'),
            cell: info => <ActionDropdown info={info} />,
        }
    ];
    
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        state: {
            sorting,
            columnFilters,
            rowSelection,
            pagination,
        },
    });

    const handleBlock = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const userIds = selectedRows.map(row => row.original.id);
        console.log("Blocking users with IDs:", userIds);
        toast.promise(
            updateUsersStatus({ userIds, action: 'ban' }),
            {
                loading: t("block_users_loading"),
                success: t("block_users_success"),
                error: t("block_users_error")
            }
        );
    };

    const handleUnblock = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const userIds = selectedRows.map(row => row.original.id);
        console.log("Unblocking users with IDs:", userIds);
        toast.promise(
            updateUsersStatus({ userIds, action: 'unban' }),
            {
                loading: t("unblock_users_loading"),
                success: t("unblock_users_success"),
                error: t("unblock_users_error")
            }
        );
    };

    const handleChangeRole = async (newRole: string) => {
        const selectedRows = table.getSelectedRowModel().rows;
        const userIds = selectedRows.map(row => row.original.id);
        console.log(`Changing role to ${newRole} for users with IDs:`, userIds);
        toast.promise(
            updateUsersRole({ userIds, newRole }),
            {
                loading: t("update_roles_loading"),
                success: t("update_roles_success", { role: uppercaseFirstLetter(t(newRole)) }),
                error: t("update_roles_error")
            }
        );
    };

    const handleDeleteClick = () => {
        const selectedRows = table.getSelectedRowModel().rows;
        if (selectedRows.length === 0) {
            toast.warning(t("no_users_selected"));
            return;
        }
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const userIds = selectedRows.map(row => row.original.id);
        setIsDeleteDialogOpen(false);
        toast.loading(t("delete_users_loading"));
        try {
            await deleteUsers(userIds);
            toast.dismiss();
            toast.success(t("delete_users_success"));
            setRowSelection({});
        } catch (error) {
            toast.dismiss();
            toast.error(t("delete_users_error"));
        }
    };

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="flex py-4 px-4">
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBlock} disabled={table.getSelectedRowModel().rows.length === 0}>
                        <Lock className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={handleUnblock} disabled={table.getSelectedRowModel().rows.length === 0}>
                        <Unlock className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleChangeRole('admin')} disabled={table.getSelectedRowModel().rows.length === 0}>
                        {t('make_admin')}
                    </Button>
                    <Button variant="outline" onClick={() => handleChangeRole('user')} disabled={table.getSelectedRowModel().rows.length === 0}>
                        {t('make_user')}
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteClick} disabled={table.getSelectedRowModel().rows.length === 0}>
                        <Trash className="h-4 w-4" />
                    </Button>
                </div>
                
                <Input
                    placeholder={t('email_search_placeholder')}
                    value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("email")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm ml-auto"
                />
            </div>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                        )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                                className={row.original.status === 'blocked' ? 'opacity-50' : ''}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <Pagination table={table} />
            <ConfirmDeleteUsersDialog 
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                handleDeleteConfirm={handleDeleteConfirm}
                selectedCount={table.getSelectedRowModel().rows.length}
            />
        </div>
    );
};

interface PaginationProps {
    table: TableType<User>;
}

const Pagination = ({ table }: PaginationProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex items-center justify-end space-x-2 py-4 px-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                {t('previous')}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                {t('next')}
            </Button>
        </div>
    );
};

const ActionDropdown = ({ info }: { info: CellContext<User, unknown>}) => {
    const navigate = useNavigate();
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
                <DropdownMenuItem onClick={() => navigate(`/admin/users/${info.row.original.id}/inventories`)}>
                    {t('view_inventories')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

