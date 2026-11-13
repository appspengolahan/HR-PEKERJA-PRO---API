import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TablePaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [25, 50],
  itemLabel = 'entri'
}) => {
  if (totalItems === 0) return null;

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIdx = (safePage - 1) * pageSize + 1;
  const endIdx = Math.min(totalItems, safePage * pageSize);

  return (
    <div className="px-3 sm:px-4 py-3 border-t border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs print:hidden">
      <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 text-slate-600">
        <span>
          Menampilkan <strong className="text-slate-900">{startIdx}–{endIdx}</strong> dari{' '}
          <strong className="text-slate-900">{totalItems}</strong> {itemLabel}
        </span>

        {onPageSizeChange && (
          <label className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
            <span>Per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="min-h-[44px] sm:min-h-[36px] px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Jumlah baris per halaman"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} baris
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={safePage <= 1}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <span className="px-3 py-2 rounded-xl bg-white border border-slate-200 font-mono font-bold text-slate-800 min-h-[44px] flex items-center">
            Hal {safePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-700 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
            aria-label="Halaman Berikutnya"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
