import React, { Fragment } from "react";

export interface TablePaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemName?: string;
  pageSizeOptions?: number[];
  className?: string;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = "items",
  pageSizeOptions = [5, 10, 20, 50, 100],
  className = "",
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRange = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-gray-50/80 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs ${className}`}
    >
      {/* Left: Showing Range and Page Size */}
      <div className="flex flex-wrap items-center gap-3 text-gray-600 dark:text-gray-400">
        <span>
          Showing{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {startRange}
          </span>{" "}
          to{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {endRange}
          </span>{" "}
          of{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {totalItems}
          </span>{" "}
          {itemName}
        </span>

        <div className="flex items-center gap-1.5 ml-2">
          <span className="text-[11px] text-gray-500">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize);
            }}
            className="px-2 py-1 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:border-[#AA2D7B] cursor-pointer"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Buttons (Always visible) */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="First Page"
        >
          «
        </button>

        {/* Previous Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Previous Page"
        >
          ‹ Prev
        </button>

        {/* Page Numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            return (
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1
            );
          })
          .map((page, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev && page - prev > 1;

            return (
              <Fragment key={page}>
                {showEllipsis && (
                  <span className="px-1 text-gray-400">...</span>
                )}
                <button
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`min-w-[28px] h-7 px-2 rounded font-medium transition-colors cursor-pointer ${
                    currentPage === page
                      ? "bg-[#AA2D7B] text-white font-bold shadow-xs"
                      : "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {page}
                </button>
              </Fragment>
            );
          })}

        {/* Next Page */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="px-2.5 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Next Page"
        >
          Next ›
        </button>

        {/* Last Page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:cursor-not-allowed"
          title="Last Page"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default TablePagination;

