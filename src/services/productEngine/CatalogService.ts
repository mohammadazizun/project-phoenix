/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Catalog Service Orchestrator (v3.5)
 */

import { BusinessEvent, TenantContext } from '../../types';
import { ProductRecord, ProductSummary, CatalogSettings } from './types';
import { CatalogRepository } from './CatalogRepository';
import { ProductActionResult } from './ProductService';
import { ProductValidator } from './ProductValidator';

export class CatalogService {
  /**
   * Retrieves enriched catalog product collection.
   */
  static async getCatalogProducts(
    organizationId: string,
    filters?: any
  ): Promise<ProductRecord[]> {
    return CatalogRepository.getCatalogProducts(organizationId, filters);
  }

  /**
   * Retrieves single enriched product detail.
   */
  static async getCatalogProductById(
    id: string,
    organizationId: string
  ): Promise<ProductRecord | null> {
    return CatalogRepository.getCatalogProductById(id, organizationId);
  }

  /**
   * Retrieves high level catalog summary metrics.
   */
  static async getCatalogSummary(organizationId: string): Promise<ProductSummary> {
    return CatalogRepository.getCatalogSummary(organizationId);
  }

  /**
   * Assigns category and brand to product item.
   */
  static async assignCategoryAndBrand(
    productId: string,
    categoryId: string | null,
    brandId: string | null,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const updated = await CatalogRepository.updateCatalogAssignments(
      productId,
      tenant.organizationId,
      categoryId,
      brandId
    );

    if (!updated) {
      return { success: false, error: 'Failed to update catalog assignments' };
    }

    const summary = await CatalogRepository.getCatalogSummary(tenant.organizationId);

    const event: BusinessEvent = {
      id: `evt_cat_assign_${Date.now()}`,
      eventType: 'catalog.assignments.updated',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        productId,
        categoryId: updated.categoryId,
        categoryName: updated.categoryName,
        brandId: updated.brandId,
        brandName: updated.brandName,
      },
      correlationId: `corr_${Date.now()}_cat_ass`,
      status: 'processed',
    };

    return { success: true, data: updated, summary, event };
  }

  /**
   * Adds an image to product catalog entry.
   */
  static async addImage(
    productId: string,
    url: string,
    altText: string | undefined,
    isPrimary: boolean,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const validation = ProductValidator.validateImage({
      organizationId: tenant.organizationId,
      productId,
      url,
      altText,
      isPrimary,
    });

    if (!validation.success) {
      return { success: false, error: validation.errors[0] || 'Invalid image URL format' };
    }

    const updated = await CatalogRepository.addProductImage(
      productId,
      tenant.organizationId,
      url,
      altText,
      isPrimary
    );

    if (!updated) {
      return { success: false, error: 'Product record not found' };
    }

    const event: BusinessEvent = {
      id: `evt_img_add_${Date.now()}`,
      eventType: 'catalog.image.added',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { productId, url, isPrimary },
      correlationId: `corr_${Date.now()}_img_add`,
      status: 'processed',
    };

    return { success: true, data: updated, event };
  }

  /**
   * Removes an image from product catalog entry.
   */
  static async removeImage(
    productId: string,
    imageId: string,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const updated = await CatalogRepository.removeProductImage(
      productId,
      imageId,
      tenant.organizationId
    );

    if (!updated) {
      return { success: false, error: 'Failed to remove image' };
    }

    const event: BusinessEvent = {
      id: `evt_img_del_${Date.now()}`,
      eventType: 'catalog.image.removed',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { productId, imageId },
      correlationId: `corr_${Date.now()}_img_del`,
      status: 'processed',
    };

    return { success: true, data: updated, event };
  }

  /**
   * Sets a primary image for product catalog item.
   */
  static async setPrimaryImage(
    productId: string,
    imageId: string,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const updated = await CatalogRepository.setPrimaryProductImage(
      productId,
      imageId,
      tenant.organizationId
    );

    if (!updated) return { success: false, error: 'Failed to update primary image' };

    return { success: true, data: updated };
  }

  /**
   * Updates tags for a product item.
   */
  static async updateTags(
    productId: string,
    tags: string[],
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const updated = await CatalogRepository.updateProductTags(
      productId,
      tags,
      tenant.organizationId
    );

    if (!updated) return { success: false, error: 'Failed to update product tags' };

    const event: BusinessEvent = {
      id: `evt_tags_upd_${Date.now()}`,
      eventType: 'catalog.tags.updated',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { productId, tags },
      correlationId: `corr_${Date.now()}_tags`,
      status: 'processed',
    };

    return { success: true, data: updated, event };
  }

  /**
   * Updates custom metadata key-value attributes.
   */
  static async updateMetadata(
    productId: string,
    metadata: Record<string, string | number | boolean>,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const updated = await CatalogRepository.updateProductMetadata(
      productId,
      metadata,
      tenant.organizationId
    );

    if (!updated) return { success: false, error: 'Failed to update product metadata' };

    return { success: true, data: updated };
  }

  /**
   * Updates catalog settings for product item.
   */
  static async updateSettings(
    productId: string,
    settings: CatalogSettings,
    organizationId: string
  ): Promise<ProductActionResult> {
    const updated = await CatalogRepository.updateProductSettings(
      productId,
      settings,
      organizationId
    );

    if (!updated) return { success: false, error: 'Failed to update catalog settings' };

    return { success: true, data: updated };
  }
}
