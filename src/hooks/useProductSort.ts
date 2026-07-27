/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Product Sorting Custom Hook
 */

import { useState, useCallback } from 'react';
import { ProductRecord, ProductSortField, ProductSortOrder, ProductSortCriteria } from '../services/productEngine/types';

export function useProductSort(initialField: ProductSortField = 'productName', initialOrder: ProductSortOrder = 'asc') {
  const [sortCriteria, setSortCriteria] = useState<ProductSortCriteria>({
    field: initialField,
    order: initialOrder,
  });

  const toggleSort = useCallback((field: ProductSortField) => {
    setSortCriteria((prev) => {
      if (prev.field === field) {
        return { field, order: prev.order === 'asc' ? 'desc' : 'asc' };
      }
      return { field, order: 'asc' };
    });
  }, []);

  const setSort = useCallback((field: ProductSortField, order: ProductSortOrder) => {
    setSortCriteria({ field, order });
  }, []);

  const sortProducts = useCallback(
    (products: ProductRecord[]): ProductRecord[] => {
      const copy = [...products];
      const { field, order } = sortCriteria;
      const factor = order === 'asc' ? 1 : -1;

      return copy.sort((a, b) => {
        if (field === 'productName') {
          return a.productName.localeCompare(b.productName) * factor;
        }
        if (field === 'sku') {
          return a.sku.localeCompare(b.sku) * factor;
        }
        if (field === 'sellingPrice') {
          return (a.sellingPrice - b.sellingPrice) * factor;
        }
        if (field === 'basePrice') {
          return (a.basePrice - b.basePrice) * factor;
        }
        if (field === 'createdAt') {
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * factor;
        }
        if (field === 'updatedAt') {
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * factor;
        }
        return 0;
      });
    },
    [sortCriteria]
  );

  return {
    sortCriteria,
    setSortCriteria,
    toggleSort,
    setSort,
    sortProducts,
  };
}
