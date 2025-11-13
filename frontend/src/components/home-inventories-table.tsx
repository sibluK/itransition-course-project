import type { HomeInventory } from "@/types/models";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Spinner } from "./ui/spinner";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "./ui/table";

interface HomeInventoriesTableProps {
    data: HomeInventory[];
    loading: boolean;
}

export function HomeInventoriesTable({ data, loading }: HomeInventoriesTableProps) {
    const { i18n, t } = useTranslation();
    const navigate = useNavigate();

    const columns = useMemo<ColumnDef<HomeInventory>[]>(() => [
        {
            accessorKey: 'title',
            header: t('inventory_title'),
            cell: info => info.getValue(),
        },
        {
            accessorKey: 'description',
            header: t('inventory_description'),
            cell: info => info.getValue(),
        },
        {
            accessorKey: 'user',
            header: 'Creator',
            cell: info => {
                const user = info.getValue() as HomeInventory["user"];
                return (
                    <div className="flex items-center gap-2">
                        <img src={user.imageUrl} alt={user.email} className="max-w-[30px] max-h-[30px] min-w-[30px] min-h-[30px] rounded-full"/>
                        <span className="text-nowrap">{user.name ? user.name : user.email}</span>
                    </div>
                );
            }
        },
    ], [i18n.language, t]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div className="overflow-hidden rounded-md border h-[400px]">
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
                {loading ? (
                    <Spinner className="w-[40px] h-[40px]" />
                ) : (
                    <TableBody>
                        {data.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    onClick={() => navigate(`/inventory/${row.original.id}/items`)}
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
                                    {t('no_results_found')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                )}
            </Table>
        </div>
    );
}