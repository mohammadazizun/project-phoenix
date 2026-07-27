/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Catalog Foundation Provider & Context (v3.5)
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TenantContext, BusinessEvent } from '../../types';
import {
  ProductRecord,
  ProductSummary,
  ProductCategory,
  ProductBrand,
  ProductUnitRecord,
  ProductTag,
  CatalogSettings,
  PRODUCT_PERMISSIONS,
} from './types';
import { ProductService, ProductActionResult } from './ProductService';
import { CategoryService } from './CategoryService';
import { BrandService } from './BrandService';
import { UnitService } from './UnitService';
import { TagService } from './TagService';
import { CatalogService } from './CatalogService';

interface ProductContextType {
  products: ProductRecord[];
  categories: ProductCategory[];
  brands: ProductBrand[];
  units: ProductUnitRecord[];
  tags: ProductTag[];
  summary: ProductSummary | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;

  // Category Actions
  createCategory: (data: { name: string; code: string; description?: string; parentId?: string }) => Promise<ProductActionResult>;
  updateCategory: (id: string, data: { name?: string; code?: string; description?: string }) => Promise<ProductActionResult>;
  deleteCategory: (id: string) => Promise<ProductActionResult>;

  // Brand Actions
  createBrand: (data: { name: string; code: string; logoUrl?: string; website?: string; description?: string }) => Promise<ProductActionResult>;
  updateBrand: (id: string, data: { name?: string; code?: string; logoUrl?: string; website?: string; description?: string }) => Promise<ProductActionResult>;
  deleteBrand: (id: string) => Promise<ProductActionResult>;

  // Unit Actions
  createUnit: (data: { name: string; code: string; symbol: string }) => Promise<ProductActionResult>;
  deleteUnit: (id: string) => Promise<ProductActionResult>;

  // Tag Actions
  createTag: (data: { name: string; color?: string }) => Promise<ProductActionResult>;
  deleteTag: (id: string) => Promise<ProductActionResult>;

  // Catalog Item Actions
  assignCategoryAndBrand: (productId: string, categoryId: string | null, brandId: string | null) => Promise<ProductActionResult>;
  addImage: (productId: string, url: string, altText?: string, isPrimary?: boolean) => Promise<ProductActionResult>;
  removeImage: (productId: string, imageId: string) => Promise<ProductActionResult>;
  setPrimaryImage: (productId: string, imageId: string) => Promise<ProductActionResult>;
  updateProductTags: (productId: string, tagNames: string[]) => Promise<ProductActionResult>;
  updateProductMetadata: (productId: string, metadata: Record<string, string | number | boolean>) => Promise<ProductActionResult>;
  updateProductSettings: (productId: string, settings: CatalogSettings) => Promise<ProductActionResult>;

  permissions: typeof PRODUCT_PERMISSIONS;
  tenant: TenantContext;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  tenant: TenantContext;
  onEmitEvent?: (event: BusinessEvent) => void;
  children: React.ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ tenant, onEmitEvent, children }) => {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<ProductBrand[]>([]);
  const [units, setUnits] = useState<ProductUnitRecord[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [summary, setSummary] = useState<ProductSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [productList, categoryList, brandList, unitList, tagList, sum] = await Promise.all([
        CatalogService.getCatalogProducts(tenant.organizationId),
        CategoryService.getCategories(tenant.organizationId),
        BrandService.getBrands(tenant.organizationId),
        UnitService.getUnits(tenant.organizationId),
        TagService.getTags(tenant.organizationId),
        CatalogService.getCatalogSummary(tenant.organizationId),
      ]);
      setProducts(productList);
      setCategories(categoryList);
      setBrands(brandList);
      setUnits(unitList);
      setTags(tagList);
      setSummary(sum);
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Product Catalog context.');
    } finally {
      setLoading(false);
    }
  }, [tenant.organizationId]);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  const emit = (event?: BusinessEvent) => {
    if (event && onEmitEvent) {
      onEmitEvent(event);
    }
  };

  // Category handlers
  const createCategory = async (data: { name: string; code: string; description?: string; parentId?: string }) => {
    const res = await CategoryService.createCategory(data, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const updateCategory = async (id: string, data: { name?: string; code?: string; description?: string }) => {
    const res = await CategoryService.updateCategory(id, data, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const deleteCategory = async (id: string) => {
    const res = await CategoryService.deleteCategory(id, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  // Brand handlers
  const createBrand = async (data: { name: string; code: string; logoUrl?: string; website?: string; description?: string }) => {
    const res = await BrandService.createBrand(data, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const updateBrand = async (id: string, data: { name?: string; code?: string; logoUrl?: string; website?: string; description?: string }) => {
    const res = await BrandService.updateBrand(id, data, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const deleteBrand = async (id: string) => {
    const res = await BrandService.deleteBrand(id, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  // Unit handlers
  const createUnit = async (data: { name: string; code: string; symbol: string }) => {
    const res = await UnitService.createUnit(data, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const deleteUnit = async (id: string) => {
    const res = await UnitService.deleteUnit(id, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  // Tag handlers
  const createTag = async (data: { name: string; color?: string }) => {
    const res = await TagService.createTag(data, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const deleteTag = async (id: string) => {
    const res = await TagService.deleteTag(id, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  // Catalog Item handlers
  const assignCategoryAndBrand = async (productId: string, categoryId: string | null, brandId: string | null) => {
    const res = await CatalogService.assignCategoryAndBrand(productId, categoryId, brandId, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const addImage = async (productId: string, url: string, altText?: string, isPrimary = false) => {
    const res = await CatalogService.addImage(productId, url, altText, isPrimary, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const removeImage = async (productId: string, imageId: string) => {
    const res = await CatalogService.removeImage(productId, imageId, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const setPrimaryImage = async (productId: string, imageId: string) => {
    const res = await CatalogService.setPrimaryImage(productId, imageId, tenant);
    if (res.success) {
      await loadCatalogData();
    }
    return res;
  };

  const updateProductTags = async (productId: string, tagNames: string[]) => {
    const res = await CatalogService.updateTags(productId, tagNames, tenant);
    if (res.success) {
      emit(res.event);
      await loadCatalogData();
    }
    return res;
  };

  const updateProductMetadata = async (productId: string, metadata: Record<string, string | number | boolean>) => {
    const res = await CatalogService.updateMetadata(productId, metadata, tenant);
    if (res.success) {
      await loadCatalogData();
    }
    return res;
  };

  const updateProductSettings = async (productId: string, settings: CatalogSettings) => {
    const res = await CatalogService.updateSettings(productId, settings, tenant.organizationId);
    if (res.success) {
      await loadCatalogData();
    }
    return res;
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        brands,
        units,
        tags,
        summary,
        loading,
        error,
        reload: loadCatalogData,
        createCategory,
        updateCategory,
        deleteCategory,
        createBrand,
        updateBrand,
        deleteBrand,
        createUnit,
        deleteUnit,
        createTag,
        deleteTag,
        assignCategoryAndBrand,
        addImage,
        removeImage,
        setPrimaryImage,
        updateProductTags,
        updateProductMetadata,
        updateProductSettings,
        permissions: PRODUCT_PERMISSIONS,
        tenant,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProductContext = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider');
  }
  return context;
};
