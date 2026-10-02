"use client";

import React from "react";
import { flexRender, type Column, type Table } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown, Search } from "lucide-react";

interface DataTableProps<TData> {
  table: Table<TData>;
  accent?: "blue" | "indigo" | "emerald" | "orange";
  compact?: boolean;
  isLoading?: boolean;
  emptyContent?: React.ReactNode;
  cellClassName?: string;
  showColumnFilters?: boolean;
  onColumnFilterChange?: (
    column: Column<TData, unknown>,
    value: string,
  ) => void;
}
const accents = {
  blue: "text-blue-500",
  indigo: "text-indigo-500",
  emerald: "text-emerald-500",
  orange: "text-orange-500",
};

function columnStyle<TData>(
  column: Column<TData, unknown>,
  header: boolean,
  compact: boolean,
): React.CSSProperties {
  const pinned = column.getIsPinned();
  return {
    width: compact ? column.getSize() : undefined,
    position: pinned || (header && compact) ? "sticky" : undefined,
    top: header && compact ? 0 : undefined,
    left: pinned === "left" ? column.getStart("left") : undefined,
    right: pinned === "right" ? column.getAfter("right") : undefined,
    zIndex: pinned ? (header ? 30 : 10) : header && compact ? 5 : undefined,
    backgroundColor:
      pinned || (header && compact) ? "var(--background)" : undefined,
  };
}

export function DataTable<TData>({
  table,
  accent = "blue",
  compact = false,
  isLoading = false,
  emptyContent,
  cellClassName = "",
  showColumnFilters = false,
  onColumnFilterChange,
}: DataTableProps<TData>): React.JSX.Element {
  const rows = table.getRowModel().rows;
  const columnCount = Math.max(1, table.getVisibleLeafColumns().length);
  const padding = compact ? "px-5 py-4 whitespace-nowrap" : "px-6 py-5";

  return (
    <table
      style={compact ? { width: table.getTotalSize() } : undefined}
      className={`${compact ? "table-fixed" : "w-full"} text-left border-collapse`}
    >
      <thead>
        {table.getHeaderGroups().map((group) => (
          <tr
            key={group.id}
            className="border-b border-slate-200/50 dark:border-zinc-800/50 bg-slate-100/50 dark:bg-zinc-900/20"
          >
            {group.headers.map((header) => {
              const column = header.column;
              const alignment = column.columnDef.meta?.align;
              const canSort = column.getCanSort();
              const sorted = column.getIsSorted();
              const sorting = column.getToggleSortingHandler();
              const heading = flexRender(
                column.columnDef.header,
                header.getContext(),
              );
              const sortIcon =
                sorted === "asc" ? (
                  <ChevronUp size={14} className={accents[accent]} />
                ) : sorted === "desc" ? (
                  <ChevronDown size={14} className={accents[accent]} />
                ) : (
                  <ChevronsUpDown
                    size={14}
                    className="text-slate-400 dark:text-zinc-600"
                  />
                );
              return (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  aria-sort={
                    canSort
                      ? sorted === "asc"
                        ? "ascending"
                        : sorted === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                  onClick={canSort && !isLoading ? sorting : undefined}
                  style={columnStyle(column, true, compact)}
                  className={`${padding} text-[10px] font-black text-slate-500 dark:text-zinc-500 uppercase tracking-widest ${alignment === "right" ? "text-right" : alignment === "center" ? "text-center" : ""} ${canSort ? "cursor-pointer select-none" : ""}`}
                >
                  {!header.isPlaceholder && (
                    <div className="flex flex-col gap-2">
                      {canSort ? (
                        <button
                          type="button"
                          disabled={isLoading}
                          className={`flex w-full items-center gap-2 text-inherit uppercase ${alignment === "right" ? "justify-end" : alignment === "center" ? "justify-center" : ""}`}
                        >
                          {heading}
                          {sortIcon}
                        </button>
                      ) : (
                        heading
                      )}
                      {column.getCanFilter() && showColumnFilters && (
                        <div
                          className="relative"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <Search
                            size={10}
                            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
                          />
                          <input
                            type="text"
                            aria-label={`Filtrar ${column.id}`}
                            placeholder="Filtrar..."
                            value={String(column.getFilterValue() ?? "")}
                            onChange={(event) => {
                              if (onColumnFilterChange)
                                onColumnFilterChange(
                                  column,
                                  event.target.value,
                                );
                              else column.setFilterValue(event.target.value);
                            }}
                            className="w-full rounded-md border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 py-1.5 pl-7 pr-2 text-[10px] text-slate-700 dark:text-zinc-300"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-slate-200/50 dark:divide-zinc-800/30">
        {isLoading ? (
          Array.from({ length: 10 }, (_, index) => (
            <tr key={index} className="animate-pulse">
              {table.getVisibleLeafColumns().map((column) => (
                <td key={column.id} className={padding}>
                  <div className="h-4 w-full rounded bg-slate-100 dark:bg-zinc-800" />
                </td>
              ))}
            </tr>
          ))
        ) : rows.length > 0 ? (
          rows.map((row) => (
            <tr
              key={row.id}
              className="group group/row hover:bg-slate-100/50 dark:hover:bg-white/[0.02] transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={columnStyle(cell.column, false, compact)}
                  className={`${padding} ${compact ? "overflow-hidden text-ellipsis" : ""} ${cellClassName}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))
        ) : emptyContent ? (
          <tr>
            <td colSpan={columnCount} className="px-6 py-24 text-center">
              {emptyContent}
            </td>
          </tr>
        ) : null}
      </tbody>
    </table>
  );
}
