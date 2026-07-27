/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Reusable Product Catalog Pagination Footer
 */

import React from 'react';
import { ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  startIndex: number;
  endIndex: number;
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  onGoToPage: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onFirstPage: () => void;
  onLastPage: () => void;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const ProductPagination: React.FC<ProductPaginationProps> = ({
  currentPage,
  totalPages,
  totalRecords,
  startIndex,
  endIndex,
  pageSize,
  onPageSizeChange,
  onGoToPage,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  hasNextPage,
  hasPrevPage,
}) => {
  if (totalRecords === 0) return null;

  // Generate page numbers array with dynamic windowing
  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
      {/* Records Count Info */}
      <div className="flex items-center gap-3 text-slate-400">
        <div>
          Showing <span className="font-bold text-white font-mono">{startIndex}</span> to{' '}
          <span className="font-bold text-white font-mono">{endIndex}</span> of{' '}
          <span className="font-bold text-indigo-400 font-mono">{totalRecords}</span> entries
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-1.5 pl-3 border-l border-slate-800">
          <span className="text-[11px]">Rows:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {[5, 10, 25, 50, 100].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Navigation Buttons */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          onClick={onFirstPage}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page */}
        <button
          onClick={onPrevPage}
          disabled={!hasPrevPage}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Pills */}
        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((num, idx) => {
            if (num === '...') {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 text-slate-600 font-bold">
                  ...
                </span>
              );
            }

            const pageNum = num as number;
            const isCurrent = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onGoToPage(pageNum)}
                className={`w-8 h-8 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                    : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          onClick={onNextPage}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page */}
        <button
          onClick={onLastPage}
          disabled={!hasNextPage}
          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
