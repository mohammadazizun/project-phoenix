/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Product Filtering Custom Hook
 */

import { useState, useCallback } from 'react';
import { ProductRecord, ProductStatus, ProductFilterCriteria } from '../services/productEngine/types';

const INITIAL_FILTER_CRITERIA: ProductFilterCriteria = {
  status: 'all',
  unit: 'all',
  minPrice: null,
  maxPrice: null,
  startDate: null,
  endDate: null,
  category: null,
  supplierId: null,
  stockStatus: null,
};

export function useProductFilter(initialCriteria?: Partial<ProductFilterCriteria>) {
  const [criteria, setCriteria] = useState<ProductFilterCriteria>({
    ...INITIAL_FILTER_CRITERIA,
    ...initialCriteria,
  });

  const setStatus = useCallback((status: ProductStatus | 'all') => {
    setCriteria((prev) => ({ ...prev, status }));
  }, []);

  const setUnit = useCallback((unit: string | 'all') => {
    setCriteria((prev) => ({ ...prev, unit }));
  }, []);

  const setPriceRange = useCallback((min: number | null, max: number | null) => {
    setCriteria((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
  }, []);

  const setDateRange = useCallback((start: string | null, end: string | null) => {
    setCriteria((prev) => ({ ...prev, startDate: start, endDate: end }));
  }, []);

  const resetFilters = useCallback(() => {
    setCriteria(INITIAL_FILTER_CRITERIA);
  }, []);

  const filterProducts = useCallback(
    (products: ProductRecord[]): ProductRecord[] => {
      return products.filter((p) => {
        // Status Filter
        if (criteria.status && criteria.status !== 'all' && p.status !== criteria.status) {
          return false;
        }

        // Unit Filter
        if (criteria.unit && criteria.unit !== 'all' && p.unit !== criteria.unit) {
          return false;
        }

        // Price Min
        if (criteria.minPrice !== null && criteria.minPrice !== undefined && p.sellingPrice < criteria.minPrice) {
          return false;
        }

        // Price Max
        if (criteria.maxPrice !== null && criteria.maxPrice !== undefined && p.sellingPrice > criteria.maxPrice) {
          return false;
        }

        // Start Date
        if (criteria.startDate) {
          const createdTime = new Date(p.createdAt).getTime();
          const startTime = new Date(criteria.startDate).getTime();
          if (createdTime < startTime) return false;
        }

        // End Date
        if (criteria.endDate) {
          const createdTime = new Date(p.createdAt).getTime();
          const endTime = new Date(criteria.endDate).getTime();
          if (createdTime > endTime) return false;
        }

        return true;
      });
    },
    [criteria]
  );

  const activeFilterCount =
    (criteria.status && criteria.status !== 'all' ? 1 : 0) +
    (criteria.unit && criteria.unit !== 'all' ? 1 : 0) +
    (criteria.minPrice !== null && criteria.minPrice !== undefined ? 1 : 0) +
    (criteria.maxPrice !== null && criteria.maxPrice !== undefined ? 1 : 0) +
    (criteria.startDate ? 1 : 0) +
    (criteria.endDate ? 1 : 0);

  return {
    criteria,
    setCriteria,
    setStatus,
    setUnit,
    setPriceRange,
    setDateRange,
    resetFilters,
    filterProducts,
    activeFilterCount,
  };
}
