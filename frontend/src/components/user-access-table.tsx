import type { AccessUser } from "@/types/models";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type Table as TableType } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Plus, UserMinus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useDebounce } from "use-debounce";
import { useUsersSearch } from "@/hooks/useUsersSearch";
import { Label } from "./ui/label";
import { Spinner } from "./ui/spinner";

interface UserAccessTableProps {
    data: AccessUser[];
    search: string;
    setSearch: (value: string) => void;
    addUserToWriteAccess: (userId: string) => Promise<void>;
    removeUsersFromWriteAccess: (userIds: string[]) => Promise<void>;
}

export function UserAccessTable({ data, search, setSearch, addUserToWriteAccess, removeUsersFromWriteAccess }: UserAccessTableProps) {
    const { i18n, t } = useTranslation();
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const columns = useMemo<ColumnDef<AccessUser>[]>(() => [
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
            cell: info => {
                const imageUrl = info.row.original.imageUrl;
                return imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="User Avatar"
                        className="h-8 w-8 rounded-full"
                    />
                ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-gray-600">N/A</span>
                    </div>
                );
            },
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: t('name'),
            cell: info => info.getValue(),
        },
        {
            id: 'email',
            accessorKey: 'email',
            header: t('email'),
            cell: info => info.getValue(),
        },
    ], [i18n.language, t]);
    
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: true,
        state: {
            pagination,
            rowSelection,
        },
    });

    useEffect(() => {
        setRowSelection({});
    }, [data]);

    const handleRemove = async () => {
        const selectedRows = table.getSelectedRowModel().rows;
        const userIds = selectedRows.map(row => row.original.id);
        await removeUsersFromWriteAccess(userIds);
        setRowSelection({});
    }

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="flex p-3 items-center gap-4">
                <h2 className="mr-auto">Users with Write Access</h2>
                <Button variant="outline" onClick={handleRemove} disabled={Object.keys(rowSelection).length === 0}>
                    <UserMinus/>
                    Remove Access
                </Button>
                <AddUserToWriteAccessButton 
                    handleAddUserToWriteAccess={addUserToWriteAccess}
                />
                <Input
                    placeholder={t('title_search_placeholder')}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="max-w-xs"
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
        </div>
    );
}

interface PaginationProps {
    table: TableType<AccessUser>;
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

const AddUserToWriteAccessButton = ({ handleAddUserToWriteAccess }: { handleAddUserToWriteAccess: (userId: string) => Promise<void> } ) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<AccessUser | null>(null);
    const [showList, setShowList] = useState(false);
    const [value] = useDebounce(searchQuery, 400);
    const { data: users, isLoading } = useUsersSearch({ query: value });

    const handleInputChange = (value: string) => {
        setSearchQuery(value);
        setShowList(value.length > 0);
    };

    const handleSelectUser = (user: AccessUser) => {
        setSelectedUser(user);
        setSearchQuery("");
    };

    const onAddUser = async () => {
        if (!selectedUser) return;
        await handleAddUserToWriteAccess(selectedUser.id);
        setSelectedUser(null);
    }
    
    return (
        <Dialog onOpenChange={() => setSelectedUser(null)}>
            <form>
                <DialogTrigger asChild>
                    <Button variant="default"><Plus />Add</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Grant user Write Access</DialogTitle>
                        <DialogDescription>
                            Users with write access will be able to add, edit, and delete items within the inventory.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedUser && (
                        <div className="flex items-center gap-2 p-2 border rounded-md">
                            <img src={selectedUser.imageUrl} className="w-[30px] h-[30px] rounded-full" />
                            <div className="flex flex-col">
                                <span>{selectedUser.name}</span>
                                <span className="text-sm text-gray-500">{selectedUser.email}</span>
                            </div>
                        </div>
                    )}
                    <div className="grid gap-4 relative">
                        <div className="grid gap-3">
                            <Label htmlFor="search">Name or Email</Label>
                            <Input
                                id="search"
                                value={searchQuery}
                                onChange={(e) => handleInputChange(e.target.value)}
                                placeholder="Enter name or email..."
                            />
                        </div>
                        {showList && searchQuery.length > 0 && (
                            <div className="text-sm absolute top-full left-0 right-0 bg-secondary border border-accent rounded-md shadow-lg z-10 max-h-40 overflow-y-auto">
                                {isLoading ? (
                                    <div className="p-2 text-gray-500"><Spinner className="mx-auto h-[20px] w-[20px]" /></div>
                                ) : users && users.length > 0 ? (
                                    users.map((user) => (
                                        <div
                                            key={user.id}
                                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer flex gap-2 items-center"
                                            onClick={() => handleSelectUser(user)}
                                        >
                                            <img src={user.imageUrl} className="w-[30px] h-[30px] rounded-full" />
                                                <div className="flex flex-col">
                                                <span>{user.name}</span>
                                                <span className="text-sm text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No users found.</div>
                                )}
                            </div>
                        )}
                        </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={onAddUser} type="submit">Grant Access</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}