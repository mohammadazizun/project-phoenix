/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Catalog Mapper & Analytical Data Formatter (v3.5)
 */

import {
  ProductRecord,
  ProductSummary,
  ProductCategory,
  ProductBrand,
  ProductUnitRecord,
  ProductImage,
} from './types';

export class CatalogMapper {
  /**
   * Enriches raw product record with category name, brand name, images fallback, and default settings.
   */
  static enrichProduct(
    product: ProductRecord,
    categories: ProductCategory[],
    brands: ProductBrand[],
    units: ProductUnitRecord[]
  ): ProductRecord {
    const category = categories.find((c) => c.id === product.categoryId);
    const brand = brands.find((b) => b.id === product.brandId);
    const unitObj = units.find((u) => u.code === product.unit || u.name === product.unit);

    return {
      ...product,
      categoryName: category ? category.name : product.categoryName || 'Uncategorized',
      brandName: brand ? brand.name : product.brandName || 'Unbranded',
      unit: unitObj ? unitObj.code : product.unit,
      images: product.images || [],
      tags: product.tags || [],
      metadata: product.metadata || {},
      settings: product.settings || {
        allowDiscounts: true,
        isTaxable: true,
        taxRate: 10,
        trackSerialNumbers: false,
        barcodeType: 'EAN-13',
        allowBackorders: false,
        defaultLeadTimeDays: 7,
      },
    };
  }

  /**
   * Calculates high-level catalog analytics including supporting entities metrics.
   */
  static calculateCatalogSummary(
    products: ProductRecord[],
    categoriesCount: number,
    brandsCount: number,
    unitsCount: number
  ): ProductSummary {
    const activeList = products.filter((p) => p.status === 'active' && !p.deletedAt);
    const draftList = products.filter((p) => p.status === 'draft' && !p.deletedAt);
    const archivedList = products.filter((p) => p.status === 'archived' && !p.deletedAt);
    const taggedProducts = products.filter((p) => p.tags && p.tags.length > 0 && !p.deletedAt);

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
      totalCategories: categoriesCount,
      totalBrands: brandsCount,
      totalUnits: unitsCount,
      totalTaggedProducts: taggedProducts.length,
    };
  }

  /**
   * Retrieves the primary image URL or fallback placeholder.
   */
  static getPrimaryImageUrl(product: ProductRecord): string {
    if (product.images && product.images.length > 0) {
      const primary = product.images.find((img) => img.isPrimary);
      if (primary) return primary.url;
      return product.images[0].url;
    }
    return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&auto=format&fit=crop&q=80';
  }
}
