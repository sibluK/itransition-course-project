import type { Item } from "@/types/models";
import { type SortingState, type ColumnFiltersState, type ColumnDef, useReactTable, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, flexRender, type Table as TableType } from "@tanstack/react-table";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Button } from "./ui/button";
import { Trash } from "lucide-react";
import { AddItemForm } from "./add-item-form";
import { useInventoryContext } from "@/contexts/inventory-provider";

interface ItemsTableProps {
    data: Item[];
    columns: ColumnDef<Item>[];
    inventoryId: number;
}

export function ItemsTable({ data, columns, inventoryId }: ItemsTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const { writeAccess } = useInventoryContext();

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
    })

    return (
        <div className="overflow-hidden rounded-md border">
            {writeAccess && (
                <div className="flex py-4 px-4">
                    <div className="flex gap-2">
                        <Button variant="destructive" disabled={table.getSelectedRowModel().rows.length === 0}>
                            <Trash className="h-4 w-4" />
                            Delete Items
                        </Button>
                    </div>
                </div>
            )}
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
                                );
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
            <Pagination table={table}/>
        </div>
    );
}

interface PaginationProps {
    table: TableType<Item>;
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