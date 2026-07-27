/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Foundation Data Mapper & Analytics Utility
 */

import { ProductRecord, ProductSummary, ProductStatus, PRODUCT_STATUSES } from './types';

export class ProductMapper {
  /**
   * Maps raw database output or state object to a clean ProductRecord DTO.
   */
  static toRecord(raw: any): ProductRecord {
    return {
      id: raw.id || `prod_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      organizationId: raw.organization_id || raw.organizationId || 'org_acme_corp',
      sku: (raw.sku || '').toUpperCase(),
      barcode: raw.barcode || null,
      productName: raw.product_name || raw.productName || 'Unnamed Product',
      description: raw.description || null,
      unit: raw.unit || 'PCS',
      basePrice: Number(raw.base_price ?? raw.basePrice ?? 0),
      sellingPrice: Number(raw.selling_price ?? raw.sellingPrice ?? 0),
      minimumStock: Number(raw.minimum_stock ?? raw.minimumStock ?? 0),
      status: (raw.status || 'active') as ProductStatus,
      createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
      updatedAt: raw.updated_at || raw.updatedAt || new Date().toISOString(),
      deletedAt: raw.deleted_at || raw.deletedAt || null,
    };
  }

  /**
   * Calculates high-level catalog summary statistics for an organization.
   */
  static calculateSummary(products: ProductRecord[]): ProductSummary {
    const activeList = products.filter((p) => p.status === 'active' && !p.deletedAt);
    const draftList = products.filter((p) => p.status === 'draft' && !p.deletedAt);
    const archivedList = products.filter((p) => p.status === 'archived' && !p.deletedAt);

    const totalCatalogValuation = activeList.reduce((acc, p) => acc + p.sellingPrice * p.minimumStock, 0);
    const totalSellingPrice = activeList.reduce((acc, p) => acc + p.sellingPrice, 0);
    const averageSellingPrice = activeList.length > 0 ? totalSellingPrice / activeList.length : 0;

    return {
      totalProducts: products.filter((p) => !p.deletedAt).length,
      activeProducts: activeList.length,
      draftProducts: draftList.length,
      archivedProducts: archivedList.length,
      totalCatalogValuation,
      averageSellingPrice,
    };
  }

  /**
   * Formats prices with current currency symbol.
   */
  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Retrieves visual status metadata badge attributes.
   */
  static getStatusMeta(status: ProductStatus) {
    const meta = PRODUCT_STATUSES.find((s) => s.key === status);
    return meta || PRODUCT_STATUSES[0];
  }
}
