/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Catalog Repository (Repository-Aware Master Data Orchestrator)
 */

import {
  ProductRecord,
  ProductFilterOptions,
  ProductSummary,
  ProductImage,
  CatalogSettings,
} from './types';
import { ProductRepository } from './ProductRepository';
import { CategoryRepository } from './CategoryRepository';
import { BrandRepository } from './BrandRepository';
import { UnitRepository } from './UnitRepository';
import { CatalogMapper } from './CatalogMapper';

export class CatalogRepository {
  /**
   * Retrieves enriched catalog product list for an organization.
   */
  static async getCatalogProducts(
    organizationId: string,
    filters?: Partial<ProductFilterOptions>
  ): Promise<ProductRecord[]> {
    const rawProducts = await ProductRepository.getAllByOrganization(organizationId, filters);
    const categories = await CategoryRepository.getAll(organizationId);
    const brands = await BrandRepository.getAll(organizationId);
    const units = await UnitRepository.getAll(organizationId);

    return rawProducts.map((p) => CatalogMapper.enrichProduct(p, categories, brands, units));
  }

  /**
   * Retrieves single enriched product record.
   */
  static async getCatalogProductById(
    id: string,
    organizationId: string
  ): Promise<ProductRecord | null> {
    const rawProduct = await ProductRepository.getById(id, organizationId);
    if (!rawProduct) return null;

    const categories = await CategoryRepository.getAll(organizationId);
    const brands = await BrandRepository.getAll(organizationId);
    const units = await UnitRepository.getAll(organizationId);

    return CatalogMapper.enrichProduct(rawProduct, categories, brands, units);
  }

  /**
   * Updates product category and brand assignments.
   */
  static async updateCatalogAssignments(
    productId: string,
    organizationId: string,
    categoryId?: string | null,
    brandId?: string | null
  ): Promise<ProductRecord | null> {
    const existing = await ProductRepository.getById(productId, organizationId);
    if (!existing) return null;

    let categoryName = existing.categoryName;
    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await CategoryRepository.getById(categoryId, organizationId);
        categoryName = cat ? cat.name : null;
      } else {
        categoryName = null;
      }
    }

    let brandName = existing.brandName;
    if (brandId !== undefined) {
      if (brandId) {
        const b = await BrandRepository.getById(brandId, organizationId);
        brandName = b ? b.name : null;
      } else {
        brandName = null;
      }
    }

    const updated = await ProductRepository.update(
      productId,
      {
        ...(categoryId !== undefined && { categoryId }),
        ...(categoryName !== undefined && { categoryName }),
        ...(brandId !== undefined && { brandId }),
        ...(brandName !== undefined && { brandName }),
      },
      organizationId
    );

    if (!updated) return null;
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Adds an image to a product catalog item.
   */
  static async addProductImage(
    productId: string,
    organizationId: string,
    url: string,
    altText?: string,
    isPrimary = false
  ): Promise<ProductRecord | null> {
    const existing = await ProductRepository.getById(productId, organizationId);
    if (!existing) return null;

    const currentImages = existing.images || [];
    const newImage: ProductImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      productId,
      url,
      isPrimary: isPrimary || currentImages.length === 0,
      altText: altText || existing.productName,
      sortOrder: currentImages.length,
      createdAt: new Date().toISOString(),
    };

    let updatedImages = [...currentImages];
    if (newImage.isPrimary) {
      updatedImages = updatedImages.map((img) => ({ ...img, isPrimary: false }));
    }
    updatedImages.push(newImage);

    await ProductRepository.update(productId, { images: updatedImages }, organizationId);
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Removes an image from a product catalog item.
   */
  static async removeProductImage(
    productId: string,
    imageId: string,
    organizationId: string
  ): Promise<ProductRecord | null> {
    const existing = await ProductRepository.getById(productId, organizationId);
    if (!existing) return null;

    const currentImages = existing.images || [];
    let updatedImages = currentImages.filter((img) => img.id !== imageId);

    // If we removed primary, promote first remaining to primary
    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isPrimary)) {
      updatedImages[0] = { ...updatedImages[0], isPrimary: true };
    }

    await ProductRepository.update(productId, { images: updatedImages }, organizationId);
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Sets a specific image as primary.
   */
  static async setPrimaryProductImage(
    productId: string,
    imageId: string,
    organizationId: string
  ): Promise<ProductRecord | null> {
    const existing = await ProductRepository.getById(productId, organizationId);
    if (!existing) return null;

    const currentImages = existing.images || [];
    const updatedImages = currentImages.map((img) => ({
      ...img,
      isPrimary: img.id === imageId,
    }));

    await ProductRepository.update(productId, { images: updatedImages }, organizationId);
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Updates product tags.
   */
  static async updateProductTags(
    productId: string,
    tags: string[],
    organizationId: string
  ): Promise<ProductRecord | null> {
    await ProductRepository.update(productId, { tags }, organizationId);
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Updates product metadata key-value attributes.
   */
  static async updateProductMetadata(
    productId: string,
    metadata: Record<string, string | number | boolean>,
    organizationId: string
  ): Promise<ProductRecord | null> {
    await ProductRepository.update(productId, { metadata }, organizationId);
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Updates product catalog settings.
   */
  static async updateProductSettings(
    productId: string,
    settings: CatalogSettings,
    organizationId: string
  ): Promise<ProductRecord | null> {
    await ProductRepository.update(productId, { settings }, organizationId);
    return this.getCatalogProductById(productId, organizationId);
  }

  /**
   * Computes comprehensive summary analytics for master catalog.
   */
  static async getCatalogSummary(organizationId: string): Promise<ProductSummary> {
    const products = await ProductRepository.getAllByOrganization(organizationId);
    const categories = await CategoryRepository.getAll(organizationId);
    const brands = await BrandRepository.getAll(organizationId);
    const units = await UnitRepository.getAll(organizationId);

    return CatalogMapper.calculateCatalogSummary(
      products,
      categories.length,
      brands.length,
      units.length
    );
  }
}
