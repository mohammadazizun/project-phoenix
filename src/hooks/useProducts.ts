/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-012
 * Product Foundation & CRUD Custom Hook
 */

import { useState, useEffect, useCallback } from 'react';
import { TenantContext, BusinessEvent } from '../types';
import { ProductRecord, ProductSummary } from '../services/productEngine/types';
import { ProductService, ProductActionResult } from '../services/productEngine/ProductService';
import { ProductInputDTO } from '../services/productEngine/ProductValidator';

export function useProducts(
  tenant: TenantContext,
  onEmitEvent?: (event: BusinessEvent) => void
) {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, sum] = await Promise.all([
        ProductService.getProducts(tenant.organizationId),
        ProductService.getCatalogSummary(tenant.organizationId),
      ]);
      setProducts(list);
      setSummary(sum);
    } catch (err: any) {
      setError(err?.message || 'Failed to load master products.');
    } finally {
      setLoading(false);
    }
  }, [tenant.organizationId]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  /**
   * Create Product Mutation
   */
  const createProduct = async (input: Partial<ProductInputDTO>): Promise<ProductActionResult> => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await ProductService.createProduct(input, tenant);
      if (result.success) {
        if (result.event && onEmitEvent) {
          onEmitEvent(result.event);
        }
        setNotification({
          type: 'success',
          message: `Product "${result.data?.productName}" (SKU: ${result.data?.sku}) created successfully.`,
        });
        await fetchCatalog();
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to create product.',
        });
      }
      return result;
    } catch (err: any) {
      const errMsg = err?.message || 'An unexpected error occurred during product creation.';
      setNotification({ type: 'error', message: errMsg });
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Update Product Mutation
   */
  const updateProduct = async (
    id: string,
    updates: Partial<ProductInputDTO>
  ): Promise<ProductActionResult> => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await ProductService.updateProduct(id, updates, tenant);
      if (result.success) {
        if (result.event && onEmitEvent) {
          onEmitEvent(result.event);
        }
        setNotification({
          type: 'success',
          message: `Product "${result.data?.productName}" updated successfully.`,
        });
        await fetchCatalog();
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to update product.',
        });
      }
      return result;
    } catch (err: any) {
      const errMsg = err?.message || 'An unexpected error occurred during product update.';
      setNotification({ type: 'error', message: errMsg });
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(false);
    }
  };

  /**
   * Soft Delete / Archive Product Mutation
   */
  const deleteProduct = async (id: string): Promise<ProductActionResult> => {
    setActionLoading(true);
    setError(null);
    try {
      const result = await ProductService.archiveProduct(id, tenant);
      if (result.success) {
        if (result.event && onEmitEvent) {
          onEmitEvent(result.event);
        }
        setNotification({
          type: 'success',
          message: 'Product soft-deleted / archived successfully.',
        });
        await fetchCatalog();
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Failed to archive product.',
        });
      }
      return result;
    } catch (err: any) {
      const errMsg = err?.message || 'An unexpected error occurred while deleting product.';
      setNotification({ type: 'error', message: errMsg });
      return { success: false, error: errMsg };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    products,
    summary,
    loading,
    actionLoading,
    error,
    notification,
    clearNotification,
    refresh: fetchCatalog,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
