import React from 'react';
import { flexRender, Table } from '@tanstack/react-table';
import { LucideIcon, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface DataTableProps<TData> {
  table: Table<TData>;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: LucideIcon;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  hoverColor?: 'indigo' | 'blue' | 'orange' | 'emerald';
}

export function DataTable<TData>({
  table,
  isLoading,
  emptyMessage = "Nenhum registro encontrado",
  emptyIcon: EmptyIcon,
  onEmptyAction,
  emptyActionLabel,
  hoverColor = 'indigo',
}: DataTableProps<TData>) {
  const columnsCount = table.getVisibleFlatColumns().length;

  const hoverClasses = {
    indigo: 'hover:bg-indigo-500/[0.03]',
    blue: 'hover:bg-blue-500/[0.03] group-hover:text-blue-400',
    orange: 'hover:bg-orange-500/[0.03]',
    emerald: 'hover:bg-emerald-500/[0.02]',
  };

  return (
    <div className={`group relative rounded-3xl border border-zinc-800/50 bg-zinc-950/20 backdrop-blur-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${hoverColor === 'blue' ? 'hover:border-blue-500/20 transition-colors duration-500' : ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-zinc-800/50 bg-zinc-900/20">
                {headerGroup.headers.map(header => {
                  const isPinned = header.column.getIsPinned();
                  const pinningStyles: React.CSSProperties = isPinned ? {
                    position: 'sticky',
                    left: isPinned === 'left' ? `${header.column.getStart('left')}px` : undefined,
                    right: isPinned === 'right' ? `${header.column.getAfter('right')}px` : undefined,
                    zIndex: 40,
                    backgroundColor: 'rgb(24, 24, 27)',
                  } : {};

                  return (
                    <th 
                      key={header.id} 
                      colSpan={header.colSpan}
                      style={{ 
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                        ...pinningStyles
                      }}
                      className={`py-4 px-5 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] font-sans whitespace-nowrap ${(header.column.columnDef as any).meta?.align === 'right' ? 'text-right' : (header.column.columnDef as any).meta?.align === 'center' ? 'text-center' : ''} ${isPinned ? 'shadow-[2px_0_10px_rgba(0,0,0,0.5)]' : ''} ${header.column.getCanSort() ? 'cursor-pointer hover:bg-zinc-800/50 transition-colors' : ''}`}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder ? null : (
                        <div className={`flex items-center gap-2 ${(header.column.columnDef as any).meta?.align === 'right' ? 'justify-end' : (header.column.columnDef as any).meta?.align === 'center' ? 'justify-center' : ''}`}>
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <div className="text-zinc-600 transition-colors">
                              {{
                                asc: <ArrowUp className="w-3 h-3 text-blue-400" />,
                                desc: <ArrowDown className="w-3 h-3 text-blue-400" />,
                              }[header.column.getIsSorted() as string] ?? <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />}
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
          <tbody className="divide-y divide-zinc-800/30">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {[...Array(columnsCount)].map((_, j) => (
                    <td key={j} className="py-5 px-6">
                      <div className={`h-4 bg-zinc-800/50 rounded-md ${j === 0 ? 'w-48' : 'w-24'}`}></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columnsCount} className="py-24 px-6 text-center">
                  <div className="flex flex-col items-center justify-center gap-4 group/icon">
                    <div className="w-16 h-16 rounded-full bg-zinc-900/50 border border-zinc-800 flex items-center justify-center text-zinc-700 group-hover/icon:text-zinc-500 transition-colors">
                      {EmptyIcon && <EmptyIcon size={32} />}
                    </div>
                    <p className="text-zinc-400 font-medium">{emptyMessage}</p>
                    {onEmptyAction && emptyActionLabel && (
                      <button onClick={onEmptyAction} className="text-xs text-blue-400 font-bold hover:underline">
                        {emptyActionLabel}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className={`group/row transition-all duration-300 ${hoverClasses[hoverColor]}`}
                >
                  {row.getVisibleCells().map(cell => {
                    const isPinned = cell.column.getIsPinned();
                    const pinningStyles: React.CSSProperties = isPinned ? {
                      position: 'sticky',
                      left: isPinned === 'left' ? `${cell.column.getStart('left')}px` : undefined,
                      right: isPinned === 'right' ? `${cell.column.getAfter('right')}px` : undefined,
                      zIndex: 10,
                      backgroundColor: 'rgba(9, 9, 11, 0.95)',
                      backdropFilter: 'blur(8px)',
                    } : {};

                    return (
                      <td 
                        key={cell.id} 
                        style={pinningStyles}
                        className={`py-4 px-5 whitespace-nowrap ${isPinned ? 'shadow-[2px_0_5px_rgba(0,0,0,0.3)]' : ''}`}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
