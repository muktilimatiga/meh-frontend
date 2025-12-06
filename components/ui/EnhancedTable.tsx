import * as React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef
} from "@tanstack/react-table";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./Table";

interface EnhancedTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  onSelectAll?: (checked: boolean) => void;
  selectedIds?: Set<string>;
  actionButtons?: React.ReactNode;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
}

export function EnhancedTable<T extends { id: string }>({ 
    data, 
    columns, 
    onSelectAll, 
    selectedIds,
    actionButtons
}: EnhancedTableProps<T>) {
    
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
        pagination: {
            pageSize: 10,
        },
    },
  });

  const isAllSelected = data.length > 0 && selectedIds?.size === data.length;
  const isSomeSelected = selectedIds && selectedIds.size > 0 && selectedIds.size < data.length;

  return (
    <div className="w-full">
      <div className="w-full overflow-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.id === 'select' && onSelectAll ? (
                        <div className="flex items-center justify-center">
                            <input 
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={isAllSelected}
                                ref={input => {
                                    if (input) input.indeterminate = !!isSomeSelected;
                                }}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </div>
                    ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={selectedIds?.has(row.original.id) && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-4 border-t border-border bg-muted/20">
        <div className="text-sm text-muted-foreground">
          {selectedIds ? `${selectedIds.size} selected` : `Total ${data.length} records`}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground mx-2">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export type { ColumnDef };