import type { ColumnDef, ColumnFiltersState, Table as TableType } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from  "@/components/ui/input";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"
import type { InventoryWithCategoryAndTags } from "@/types/models";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useNavigate } from "react-router";

interface InventoriesTableProps {
    data: InventoryWithCategoryAndTags[];
}

export function InventoriesTable({ data }: InventoriesTableProps) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    
    const columns = useMemo<ColumnDef<InventoryWithCategoryAndTags>[]>(() => [
        {
            accessorKey: 'inventory.id',
            header: 'ID',
            cell: info => info.getValue(),
        },
        {
            id: 'title',
            accessorKey: 'inventory.title',
            header: t('inventory_title'),
            cell: info => info.getValue(),
        },
        {
            accessorKey: 'inventory.description',
            header: t('inventory_description'),
            cell: info => info.getValue(),
        },
        {
            accessorKey: 'category.name',
            header: t('inventory_category'),
            cell: info => info.getValue(),
        },
        {
            accessorKey: 'tags',
            header: t('inventory_tags'),
            cell: info => {
                const tags = info.getValue() as InventoryWithCategoryAndTags["tags"];
                return tags.map((tag) => tag.name).join(", ");
            }
        }, 
        {
            accessorKey: 'inventory.createdAt',
            header: t('inventory_created_at'),
            cell: info => new Date(info.getValue() as string).toLocaleDateString(i18n.language),
        },
        {
            accessorKey: 'inventory.updatedAt',
            header: t('inventory_updated_at'),
            cell: info => new Date(info.getValue() as string).toLocaleDateString(i18n.language),
        }
    ], [i18n.language, t]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: true,
        state: {
            rowSelection,
            pagination,
            columnFilters,
        },
    })

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="flex p-3">
                <Input
                    placeholder={t('title_search_placeholder')}
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
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
                                onClick={() => navigate(`/inventory/${row.original.inventory.id}/items`)}
                                className="hover:cursor-pointer"
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
    table: TableType<InventoryWithCategoryAndTags>;
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