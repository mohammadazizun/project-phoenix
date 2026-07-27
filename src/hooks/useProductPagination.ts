/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Product Pagination Custom Hook
 */

import { useState, useCallback, useMemo } from 'react';
import { ProductRecord } from '../services/productEngine/types';

export function useProductPagination(initialPage: number = 1, initialPageSize: number = 10) {
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const paginateProducts = useCallback(
    (products: ProductRecord[]) => {
      const totalRecords = products.length;
      const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

      // Auto-correct page if current page exceeds totalPages due to filtering
      const validPage = Math.min(Math.max(1, page), totalPages);

      const startIndex = (validPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalRecords);
      const paginatedItems = products.slice(startIndex, endIndex);

      return {
        paginatedItems,
        totalRecords,
        totalPages,
        currentPage: validPage,
        startIndex: totalRecords === 0 ? 0 : startIndex + 1,
        endIndex,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1,
      };
    },
    [page, pageSize]
  );

  const goToPage = useCallback((newPage: number) => {
    setPage((prev) => (newPage < 1 ? 1 : newPage));
  }, []);

  const changePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1); // Reset to page 1 on page size change
  }, []);

  const nextPage = useCallback(() => setPage((p) => p + 1), []);
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), []);
  const firstPage = useCallback(() => setPage(1), []);
  const lastPage = useCallback((totalPages: number) => setPage(Math.max(1, totalPages)), []);

  return {
    page,
    pageSize,
    setPage,
    setPageSize: changePageSize,
    paginateProducts,
    goToPage,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}
