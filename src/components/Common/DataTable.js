import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableColumn, 
  TableRow, 
  TableCell,
  Tooltip
} from '@heroui/react';

const DataTable = ({ 
  columns = [], 
  data = [], 
  renderCell,
  emptyContent = "No records found",
  ariaLabel = "Data table"
}) => {
  return (
    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-slate-800/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Table 
        aria-label={ariaLabel}
        removeWrapper
        classNames={{
          base: "max-w-full overflow-x-auto custom-scrollbar",
          table: "min-w-[800px]",
          thead: "[&>tr]:first:rounded-none bg-slate-50/50 dark:bg-slate-950/30",
          th: "bg-transparent text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-[10px] py-6 border-b border-slate-100 dark:border-slate-800",
          td: "py-5 text-sm font-medium border-b border-slate-50 dark:border-slate-800/50",
          tr: "hover:bg-slate-50/30 dark:hover:bg-slate-800/20 transition-colors cursor-default"
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn 
              key={column.key} 
              align={column.align || "start"}
              className={column.className}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody 
          items={data} 
          emptyContent={
            <div className="py-20 flex flex-col items-center justify-center opacity-40">
               <p className="text-lg font-bold">{emptyContent}</p>
            </div>
          }
        >
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>
                  {renderCell ? renderCell(item, columnKey) : item[columnKey]}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
