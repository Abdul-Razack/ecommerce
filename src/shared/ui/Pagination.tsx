'use client';

import React, { useMemo, useState, useEffect } from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  itemLabel?: string;
  showPageSizeSelector?: boolean;
  showItemCount?: boolean;
  hideOnSinglePage?: boolean;
  className?: string;
}

export interface UsePaginationOptions<T> {
  items: T[];
  initialPage?: number;
  initialPageSize?: number;
}

/**
 * Reusable hook to manage client-side list pagination
 */
export function usePagination<T>({
  items,
  initialPage = 1,
  initialPageSize = 10,
}: UsePaginationOptions<T>) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 if current page becomes invalid (e.g. after search/filter)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedItems = useMemo(() => {
    if (!items || items.length === 0) return [];
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, totalItems);

  return {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize: handlePageSizeChange,
    totalPages,
    totalItems,
    paginatedItems,
    startIndex,
    endIndex,
  };
}

/**
 * Generates an array of page numbers with ellipses (e.g., [1, '...', 4, 5, 6, '...', 10])
 */
function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  const showEllipsisStart = currentPage > 4;
  const showEllipsisEnd = currentPage < totalPages - 3;

  pages.push(1);

  if (showEllipsisStart) {
    pages.push('ellipsis-start');
  }

  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (!showEllipsisStart) {
    end = 4;
  }
  if (!showEllipsisEnd) {
    start = totalPages - 3;
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (showEllipsisEnd) {
    pages.push('ellipsis-end');
  }

  pages.push(totalPages);

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
  showPageSizeSelector = true,
  showItemCount = true,
  hideOnSinglePage = false,
  className = '',
}: PaginationProps) {
  if (hideOnSinglePage && totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const startItem = totalItems !== undefined ? (totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1) : null;
  const endItem = totalItems !== undefined ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-t border-zinc-100 text-xs text-zinc-500 font-medium ${className}`}
    >
      {/* Left: Item Range Info & Optional Page Size Selector */}
      <div className="flex flex-wrap items-center gap-4 text-center sm:text-left">
        {showItemCount && totalItems !== undefined && (
          <p className="text-[11px] uppercase tracking-wider font-semibold text-zinc-500">
            Showing <span className="font-black text-black">{startItem}</span>–<span className="font-black text-black">{endItem}</span> of{' '}
            <span className="font-black text-black">{totalItems}</span> {itemLabel}
          </p>
        )}

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Per page:</span>
            <select
              aria-label="Items per page"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="bg-zinc-50 border border-zinc-200 text-black text-xs font-bold px-2 py-1 rounded focus:outline-none focus:border-black transition-colors cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <nav aria-label="Pagination" className="flex items-center gap-1 sm:gap-1.5 select-none">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
          title="First page"
          className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none text-xs font-bold"
        >
          «
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          title="Previous page"
          className="h-8 px-2.5 sm:h-9 sm:px-3 flex items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold uppercase tracking-wider"
        >
          ‹ Prev
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span
                  key={`${page}-${idx}`}
                  className="h-8 w-6 sm:h-9 sm:w-8 flex items-center justify-center text-zinc-400 font-bold select-none text-xs"
                >
                  …
                </span>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`Page ${page}`}
                className={`h-8 min-w-[32px] sm:h-9 sm:min-w-[36px] px-2 flex items-center justify-center rounded text-xs font-black transition-all ${
                  isActive
                    ? 'bg-black text-white border border-black shadow-sm'
                    : 'border border-zinc-200 bg-white text-zinc-700 hover:border-black hover:text-black hover:bg-zinc-50'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          title="Next page"
          className="h-8 px-2.5 sm:h-9 sm:px-3 flex items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none text-[11px] font-bold uppercase tracking-wider"
        >
          Next ›
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          title="Last page"
          className="h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-black hover:border-black transition-all disabled:opacity-30 disabled:pointer-events-none text-xs font-bold"
        >
          »
        </button>
      </nav>
    </div>
  );
}
