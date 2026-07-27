/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * URL Query State Synchronization Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { ProductStatus, ProductSortField, ProductSortOrder } from '../services/productEngine/types';

export interface ProductQueryParams {
  search: string;
  status: ProductStatus | 'all';
  unit: string | 'all';
  minPrice: string;
  maxPrice: string;
  startDate: string;
  endDate: string;
  sortField: ProductSortField;
  sortOrder: ProductSortOrder;
  page: number;
  pageSize: number;
}

const DEFAULT_QUERY_PARAMS: ProductQueryParams = {
  search: '',
  status: 'all',
  unit: 'all',
  minPrice: '',
  maxPrice: '',
  startDate: '',
  endDate: '',
  sortField: 'productName',
  sortOrder: 'asc',
  page: 1,
  pageSize: 10,
};

function parseUrlParams(): ProductQueryParams {
  if (typeof window === 'undefined') return DEFAULT_QUERY_PARAMS;
  const searchParams = new URLSearchParams(window.location.search);

  const search = searchParams.get('q') || searchParams.get('search') || '';
  const status = (searchParams.get('status') as ProductStatus) || 'all';
  const unit = searchParams.get('unit') || 'all';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  const sortField = (searchParams.get('sortField') as ProductSortField) || 'productName';
  const sortOrder = (searchParams.get('sortOrder') as ProductSortOrder) || 'asc';

  const pageRaw = parseInt(searchParams.get('page') || '1', 10);
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;

  const pageSizeRaw = parseInt(searchParams.get('pageSize') || '10', 10);
  const pageSize = [5, 10, 25, 50, 100].includes(pageSizeRaw) ? pageSizeRaw : 10;

  return {
    search,
    status,
    unit,
    minPrice,
    maxPrice,
    startDate,
    endDate,
    sortField,
    sortOrder,
    page,
    pageSize,
  };
}

export function useProductQueryState() {
  const [params, setParams] = useState<ProductQueryParams>(parseUrlParams);

  // Sync state to URL without full page reload
  const updateUrl = useCallback((newParams: ProductQueryParams) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const sp = url.searchParams;

    if (newParams.search) sp.set('q', newParams.search);
    else sp.delete('q');

    if (newParams.status !== 'all') sp.set('status', newParams.status);
    else sp.delete('status');

    if (newParams.unit !== 'all') sp.set('unit', newParams.unit);
    else sp.delete('unit');

    if (newParams.minPrice) sp.set('minPrice', newParams.minPrice);
    else sp.delete('minPrice');

    if (newParams.maxPrice) sp.set('maxPrice', newParams.maxPrice);
    else sp.delete('maxPrice');

    if (newParams.startDate) sp.set('startDate', newParams.startDate);
    else sp.delete('startDate');

    if (newParams.endDate) sp.set('endDate', newParams.endDate);
    else sp.delete('endDate');

    if (newParams.sortField !== 'productName') sp.set('sortField', newParams.sortField);
    else sp.delete('sortField');

    if (newParams.sortOrder !== 'asc') sp.set('sortOrder', newParams.sortOrder);
    else sp.delete('sortOrder');

    if (newParams.page > 1) sp.set('page', newParams.page.toString());
    else sp.delete('page');

    if (newParams.pageSize !== 10) sp.set('pageSize', newParams.pageSize.toString());
    else sp.delete('pageSize');

    window.history.replaceState({}, '', `${url.pathname}${url.search}`);
  }, []);

  const setQueryParams = useCallback(
    (updater: Partial<ProductQueryParams> | ((prev: ProductQueryParams) => ProductQueryParams)) => {
      setParams((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        updateUrl(next);
        return next;
      });
    },
    [updateUrl]
  );

  // Listen for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      setParams(parseUrlParams());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    params,
    setQueryParams,
    resetQueryParams: useCallback(() => {
      setParams(DEFAULT_QUERY_PARAMS);
      updateUrl(DEFAULT_QUERY_PARAMS);
    }, [updateUrl]),
  };
}
