/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Debounced Product Search Custom Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { ProductRecord } from '../services/productEngine/types';

export function useProductSearch(initialSearch: string = '', delayMs: number = 300) {
  const [searchInput, setSearchInput] = useState<string>(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState<string>(initialSearch);

  useEffect(() => {
    setSearchInput(initialSearch);
    setDebouncedSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [searchInput, delayMs]);

  /**
   * Normalizes search string (trims whitespace, replaces multiple spaces with single space)
   */
  const normalizeQuery = (query: string): string => {
    return query.trim().replace(/\s+/g, ' ').toLowerCase();
  };

  /**
   * Filters products array based on debounced search query
   */
  const searchProducts = useCallback(
    (products: ProductRecord[]): ProductRecord[] => {
      const q = normalizeQuery(debouncedSearch);
      if (!q) return products;

      return products.filter((p) => {
        const nameMatch = p.productName.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        const barcodeMatch = p.barcode ? p.barcode.toLowerCase().includes(q) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;

        return nameMatch || skuMatch || barcodeMatch || descMatch;
      });
    },
    [debouncedSearch]
  );

  return {
    searchInput,
    setSearchInput,
    debouncedSearch,
    clearSearch: () => setSearchInput(''),
    searchProducts,
    isSearching: searchInput !== debouncedSearch,
  };
}
