import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type Column<T> = {
  header: string;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export default function DataTableCard<T>({
  columns,
  rows,
  rowKey,
  emptyText = "Belum ada data.",
  emptyIcon,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyText?: string;
  emptyIcon?: LucideIcon;
}) {
  if (rows.length === 0) {
    return <EmptyState icon={emptyIcon}>{emptyText}</EmptyState>;
  }

  return (
    <Card className="py-0">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={column.header}
                className={cn(
                  index === 0 && "pl-4",
                  index === columns.length - 1 && "pr-4",
                  column.headerClassName ?? column.className,
                )}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={rowKey(row)}>
              {columns.map((column, index) => (
                <TableCell
                  key={column.header}
                  className={cn(index === 0 && "pl-4", index === columns.length - 1 && "pr-4", column.className)}
                >
                  {column.cell(row, rowIndex)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
