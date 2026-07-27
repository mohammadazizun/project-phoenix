/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Unified Product Browsing Orchestrator Hook
 */

import { useEffect, useMemo, useCallback } from 'react';
import { ProductRecord, ProductStatus, ProductSortField, ProductSortOrder } from '../services/productEngine/types';
import { useProductQueryState } from './useProductQueryState';
import { useProductSearch } from './useProductSearch';
import { useProductFilter } from './useProductFilter';
import { useProductSort } from './useProductSort';
import { useProductPagination } from './useProductPagination';

export function useProductBrowsing(allProducts: ProductRecord[]) {
  const { params, setQueryParams, resetQueryParams } = useProductQueryState();

  const { searchInput, setSearchInput, debouncedSearch, clearSearch, searchProducts, isSearching } =
    useProductSearch(params.search, 300);

  const {
    criteria: filterCriteria,
    setCriteria: setFilterCriteria,
    setStatus,
    setUnit,
    setPriceRange,
    setDateRange,
    resetFilters,
    filterProducts,
    activeFilterCount,
  } = useProductFilter({
    status: params.status,
    unit: params.unit,
    minPrice: params.minPrice ? parseFloat(params.minPrice) : null,
    maxPrice: params.maxPrice ? parseFloat(params.maxPrice) : null,
    startDate: params.startDate || null,
    endDate: params.endDate || null,
  });

  const { sortCriteria, setSortCriteria, toggleSort, setSort, sortProducts } = useProductSort(
    params.sortField,
    params.sortOrder
  );

  const { page, pageSize, setPage, setPageSize, paginateProducts, goToPage, nextPage, prevPage, firstPage, lastPage } =
    useProductPagination(params.page, params.pageSize);

  // Sync state changes back to URL query state
  useEffect(() => {
    setQueryParams({
      search: searchInput,
      status: filterCriteria.status || 'all',
      unit: filterCriteria.unit || 'all',
      minPrice: filterCriteria.minPrice !== null && filterCriteria.minPrice !== undefined ? String(filterCriteria.minPrice) : '',
      maxPrice: filterCriteria.maxPrice !== null && filterCriteria.maxPrice !== undefined ? String(filterCriteria.maxPrice) : '',
      startDate: filterCriteria.startDate || '',
      endDate: filterCriteria.endDate || '',
      sortField: sortCriteria.field,
      sortOrder: sortCriteria.order,
      page,
      pageSize,
    });
  }, [
    searchInput,
    filterCriteria,
    sortCriteria,
    page,
    pageSize,
    setQueryParams,
  ]);

  // Execute processing pipeline: Search -> Filter -> Sort
  const processedProducts = useMemo(() => {
    const searched = searchProducts(allProducts);
    const filtered = filterProducts(searched);
    const sorted = sortProducts(filtered);
    return sorted;
  }, [allProducts, searchProducts, filterProducts, sortProducts]);

  // Execute pagination pipeline
  const paginationData = useMemo(() => {
    return paginateProducts(processedProducts);
  }, [processedProducts, paginateProducts]);

  // Reset all filters and search
  const resetAll = useCallback(() => {
    clearSearch();
    resetFilters();
    setSort('productName', 'asc');
    setPage(1);
    resetQueryParams();
  }, [clearSearch, resetFilters, setSort, setPage, resetQueryParams]);

  const hasActiveSearchOrFilter =
    !!searchInput ||
    activeFilterCount > 0 ||
    sortCriteria.field !== 'productName' ||
    sortCriteria.order !== 'asc';

  return {
    // Search
    searchInput,
    setSearchInput,
    debouncedSearch,
    clearSearch,
    isSearching,

    // Filters
    filterCriteria,
    setStatus: (status: ProductStatus | 'all') => {
      setStatus(status);
      setPage(1);
    },
    setUnit: (unit: string | 'all') => {
      setUnit(unit);
      setPage(1);
    },
    setPriceRange: (min: number | null, max: number | null) => {
      setPriceRange(min, max);
      setPage(1);
    },
    setDateRange: (start: string | null, end: string | null) => {
      setDateRange(start, end);
      setPage(1);
    },
    resetFilters,
    activeFilterCount,

    // Sorting
    sortCriteria,
    toggleSort,
    setSort,

    // Pagination
    page: paginationData.currentPage,
    pageSize,
    setPageSize,
    totalRecords: paginationData.totalRecords,
    totalPages: paginationData.totalPages,
    startIndex: paginationData.startIndex,
    endIndex: paginationData.endIndex,
    hasNextPage: paginationData.hasNextPage,
    hasPrevPage: paginationData.hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    firstPage: () => firstPage(),
    lastPage: () => lastPage(paginationData.totalPages),

    // Dataset outputs
    rawProductCount: allProducts.length,
    filteredProducts: processedProducts,
    paginatedProducts: paginationData.paginatedItems,

    // Global Reset
    hasActiveSearchOrFilter,
    resetAll,
  };
}
