/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Foundation Service Orchestrator (v3.2)
 */

import { BusinessEvent, TenantContext } from '../../types';
import { ProductRecord, ProductSummary, ProductFilterOptions, ProductStatus } from './types';
import { ProductRepository } from './ProductRepository';
import { ProductValidator, ProductInputDTO } from './ProductValidator';
import { ProductMapper } from './ProductMapper';

export interface ProductActionResult {
  success: boolean;
  data?: ProductRecord;
  summary?: ProductSummary;
  event?: BusinessEvent;
  error?: string;
  validationErrors?: string[];
}

export class ProductService {
  /**
   * Retrieves all active products for the given organization context.
   */
  static async getProducts(
    organizationId: string,
    filters?: Partial<ProductFilterOptions>
  ): Promise<ProductRecord[]> {
    return ProductRepository.getAllByOrganization(organizationId, filters);
  }

  /**
   * Retrieves single product by ID ensuring tenant isolation.
   */
  static async getProductById(id: string, organizationId: string): Promise<ProductRecord | null> {
    return ProductRepository.getById(id, organizationId);
  }

  /**
   * Retrieves summary analytics for organization catalog.
   */
  static async getCatalogSummary(organizationId: string): Promise<ProductSummary> {
    return ProductRepository.getSummary(organizationId);
  }

  /**
   * Creates a new master product entry (Validation & Event Generation).
   */
  static async createProduct(
    input: Partial<ProductInputDTO>,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const rawPayload = {
      ...input,
      organizationId: tenant.organizationId,
    };

    // 1. Validation
    const validation = ProductValidator.validate(rawPayload);
    if (!validation.success) {
      return {
        success: false,
        error: 'Product validation failed',
        validationErrors: 'errors' in validation ? validation.errors : [],
      };
    }

    const dto = validation.data;

    // 2. Uniqueness check for SKU
    const existingSku = await ProductRepository.getBySku(dto.sku, tenant.organizationId);
    if (existingSku) {
      return {
        success: false,
        error: `SKU code "${dto.sku}" is already registered in this organization`,
      };
    }

    // 3. Map to Record
    const record: ProductRecord = ProductMapper.toRecord({
      organization_id: tenant.organizationId,
      sku: dto.sku,
      barcode: dto.barcode || null,
      product_name: dto.productName,
      description: dto.description || null,
      unit: dto.unit,
      base_price: dto.basePrice,
      selling_price: dto.sellingPrice,
      minimum_stock: dto.minimumStock,
      status: dto.status,
    });

    // 4. Persist in Repository
    const created = await ProductRepository.create(record);
    const summary = await ProductRepository.getSummary(tenant.organizationId);

    // 5. Emit Event Contract
    const event: BusinessEvent = {
      id: `evt_prod_${Date.now()}`,
      eventType: 'product.created',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        productId: created.id,
        sku: created.sku,
        productName: created.productName,
        sellingPrice: created.sellingPrice,
        unit: created.unit,
        status: created.status,
      },
      correlationId: `corr_${Date.now()}_prod`,
      status: 'processed',
    };

    return {
      success: true,
      data: created,
      summary,
      event,
    };
  }

  /**
   * Updates existing product metadata.
   */
  static async updateProduct(
    id: string,
    updates: Partial<ProductInputDTO>,
    tenant: TenantContext
  ): Promise<ProductActionResult> {
    const existing = await ProductRepository.getById(id, tenant.organizationId);
    if (!existing) {
      return {
        success: false,
        error: 'Product record not found',
      };
    }

    // Uniqueness check if SKU changed
    if (updates.sku && updates.sku.toUpperCase() !== existing.sku) {
      const existingSku = await ProductRepository.getBySku(updates.sku, tenant.organizationId);
      if (existingSku) {
        return {
          success: false,
          error: `SKU code "${updates.sku}" is already registered in this organization`,
        };
      }
    }

    const updated = await ProductRepository.update(
      id,
      {
        ...(updates.sku && { sku: updates.sku.toUpperCase() }),
        ...(updates.barcode !== undefined && { barcode: updates.barcode }),
        ...(updates.productName && { productName: updates.productName }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.unit && { unit: updates.unit }),
        ...(updates.basePrice !== undefined && { basePrice: updates.basePrice }),
        ...(updates.sellingPrice !== undefined && { sellingPrice: updates.sellingPrice }),
        ...(updates.minimumStock !== undefined && { minimumStock: updates.minimumStock }),
        ...(updates.status && { status: updates.status as ProductStatus }),
      },
      tenant.organizationId
    );

    if (!updated) {
      return { success: false, error: 'Failed to update product record' };
    }

    const summary = await ProductRepository.getSummary(tenant.organizationId);

    const event: BusinessEvent = {
      id: `evt_prod_${Date.now()}`,
      eventType: 'product.updated',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        productId: updated.id,
        sku: updated.sku,
        productName: updated.productName,
        status: updated.status,
      },
      correlationId: `corr_${Date.now()}_prod_upd`,
      status: 'processed',
    };

    return {
      success: true,
      data: updated,
      summary,
      event,
    };
  }

  /**
   * Soft deletes / archives product record.
   */
  static async archiveProduct(id: string, tenant: TenantContext): Promise<ProductActionResult> {
    const existing = await ProductRepository.getById(id, tenant.organizationId);
    if (!existing) {
      return { success: false, error: 'Product record not found' };
    }

    const deleted = await ProductRepository.softDelete(id, tenant.organizationId);
    if (!deleted) {
      return { success: false, error: 'Failed to archive product record' };
    }

    const summary = await ProductRepository.getSummary(tenant.organizationId);

    const event: BusinessEvent = {
      id: `evt_prod_${Date.now()}`,
      eventType: 'product.archived',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        productId: id,
        sku: existing.sku,
        productName: existing.productName,
      },
      correlationId: `corr_${Date.now()}_prod_arc`,
      status: 'processed',
    };

    return {
      success: true,
      summary,
      event,
    };
  }
}
