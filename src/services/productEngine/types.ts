/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Catalog Domain Types & Supporting Master Data (v3.5)
 */

export type ProductStatus = 'active' | 'inactive' | 'archived' | 'draft';

export type ProductUnit = 
  | 'PCS' 
  | 'BOX' 
  | 'KG' 
  | 'METER' 
  | 'SET' 
  | 'UNIT' 
  | 'PACK' 
  | 'LITER' 
  | 'PAIR'
  | 'ROLL';

export interface ProductCategory {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description?: string | null;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProductBrand {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  logoUrl?: string | null;
  website?: string | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProductUnitRecord {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  symbol: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProductImage {
  id: string;
  organizationId: string;
  productId: string;
  url: string;
  isPrimary: boolean;
  altText?: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface ProductTag {
  id: string;
  organizationId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface CatalogSettings {
  allowDiscounts: boolean;
  isTaxable: boolean;
  taxRate: number; // e.g. 10 = 10%
  trackSerialNumbers: boolean;
  barcodeType: 'EAN-13' | 'UPC-A' | 'CODE-128' | 'QR';
  allowBackorders: boolean;
  defaultLeadTimeDays: number;
}

export interface ProductRecord {
  id: string;
  organizationId: string;
  sku: string;
  barcode?: string | null;
  productName: string;
  description?: string | null;
  unit: ProductUnit | string;
  basePrice: number;
  sellingPrice: number;
  minimumStock: number;
  status: ProductStatus;

  // Catalog Supporting Relationships & Metadata (Execution-014)
  categoryId?: string | null;
  categoryName?: string | null;
  brandId?: string | null;
  brandName?: string | null;
  images?: ProductImage[];
  tags?: string[];
  metadata?: Record<string, string | number | boolean>;
  settings?: CatalogSettings;

  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProductSummary {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalCatalogValuation: number;
  averageSellingPrice: number;
  // Catalog Master Data Counters (Execution-014)
  totalCategories?: number;
  totalBrands?: number;
  totalUnits?: number;
  totalTaggedProducts?: number;
}

export type ProductSortField = 'productName' | 'sku' | 'sellingPrice' | 'basePrice' | 'createdAt' | 'updatedAt';
export type ProductSortOrder = 'asc' | 'desc';

export interface ProductFilterCriteria {
  status?: ProductStatus | 'all';
  unit?: string | 'all';
  searchQuery?: string;
  minPrice?: number | null;
  maxPrice?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
  brandId?: string | null;
  tag?: string | null;
  supplierId?: string | null;
  stockStatus?: string | null;
}

export interface ProductSortCriteria {
  field: ProductSortField;
  order: ProductSortOrder;
}

export interface ProductFilterOptions {
  organizationId: string;
  status?: ProductStatus | 'all';
  searchQuery?: string;
  unit?: string;
  categoryId?: string;
  brandId?: string;
  tag?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export const PRODUCT_PERMISSIONS = {
  READ: 'product:read',
  CREATE: 'product:create',
  UPDATE: 'product:update',
  DELETE: 'product:delete',
  SUMMARY: 'product:summary',
  MANAGE_PRICE: 'product:manage_price',
  MANAGE_CATALOG: 'product:manage_catalog',
} as const;

export const PRODUCT_STATUSES: {
  key: ProductStatus;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}[] = [
  {
    key: 'active',
    label: 'Active',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    key: 'draft',
    label: 'Draft',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    key: 'inactive',
    label: 'Inactive',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
  },
  {
    key: 'archived',
    label: 'Archived',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
];

export const PRODUCT_UNITS: { key: ProductUnit; label: string }[] = [
  { key: 'PCS', label: 'Pieces (PCS)' },
  { key: 'BOX', label: 'Box (BOX)' },
  { key: 'SET', label: 'Set (SET)' },
  { key: 'UNIT', label: 'Unit (UNIT)' },
  { key: 'KG', label: 'Kilogram (KG)' },
  { key: 'METER', label: 'Meter (METER)' },
  { key: 'PACK', label: 'Pack (PACK)' },
  { key: 'LITER', label: 'Liter (LITER)' },
  { key: 'PAIR', label: 'Pair (PAIR)' },
  { key: 'ROLL', label: 'Roll (ROLL)' },
];

export const DEFAULT_CATALOG_SETTINGS: CatalogSettings = {
  allowDiscounts: true,
  isTaxable: true,
  taxRate: 10,
  trackSerialNumbers: false,
  barcodeType: 'EAN-13',
  allowBackorders: false,
  defaultLeadTimeDays: 7,
};

export const PRODUCT_DEFAULTS = {
  UNIT: 'PCS' as ProductUnit,
  STATUS: 'active' as ProductStatus,
  MINIMUM_STOCK: 10,
  BASE_PRICE: 0,
  SELLING_PRICE: 0,
  SETTINGS: DEFAULT_CATALOG_SETTINGS,
};

