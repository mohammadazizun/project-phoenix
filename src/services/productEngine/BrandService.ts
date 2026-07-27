/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Brand Service Orchestrator (v3.5)
 */

import { BusinessEvent, TenantContext } from '../../types';
import { ProductBrand } from './types';
import { BrandRepository } from './BrandRepository';
import { ProductValidator, BrandInputDTO } from './ProductValidator';

export interface BrandActionResult {
  success: boolean;
  data?: ProductBrand;
  event?: BusinessEvent;
  error?: string;
  validationErrors?: string[];
}

export class BrandService {
  static async getBrands(organizationId: string): Promise<ProductBrand[]> {
    return BrandRepository.getAll(organizationId);
  }

  static async getBrandById(id: string, organizationId: string): Promise<ProductBrand | null> {
    return BrandRepository.getById(id, organizationId);
  }

  static async createBrand(
    input: Partial<BrandInputDTO>,
    tenant: TenantContext
  ): Promise<BrandActionResult> {
    const rawPayload = {
      ...input,
      organizationId: tenant.organizationId,
    };

    const validation = ProductValidator.validateBrand(rawPayload);
    if (!validation.success) {
      return {
        success: false,
        error: 'Brand validation failed',
        validationErrors: 'errors' in validation ? validation.errors : [],
      };
    }

    const dto = validation.data;

    const existingCode = await BrandRepository.getByCode(dto.code, tenant.organizationId);
    if (existingCode) {
      return {
        success: false,
        error: `Brand code "${dto.code}" is already registered in this organization`,
      };
    }

    const record: ProductBrand = {
      id: `brand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: tenant.organizationId,
      name: dto.name,
      code: dto.code.toUpperCase(),
      logoUrl: dto.logoUrl || null,
      website: dto.website || null,
      description: dto.description || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await BrandRepository.create(record);

    const event: BusinessEvent = {
      id: `evt_brand_${Date.now()}`,
      eventType: 'brand.created',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        brandId: created.id,
        brandName: created.name,
        brandCode: created.code,
      },
      correlationId: `corr_${Date.now()}_brand`,
      status: 'processed',
    };

    return { success: true, data: created, event };
  }

  static async updateBrand(
    id: string,
    updates: Partial<BrandInputDTO>,
    tenant: TenantContext
  ): Promise<BrandActionResult> {
    const existing = await BrandRepository.getById(id, tenant.organizationId);
    if (!existing) return { success: false, error: 'Brand record not found' };

    if (updates.code && updates.code.toUpperCase() !== existing.code) {
      const existingCode = await BrandRepository.getByCode(updates.code, tenant.organizationId);
      if (existingCode) {
        return {
          success: false,
          error: `Brand code "${updates.code}" is already registered`,
        };
      }
    }

    const updated = await BrandRepository.update(
      id,
      {
        ...(updates.name && { name: updates.name }),
        ...(updates.code && { code: updates.code.toUpperCase() }),
        ...(updates.logoUrl !== undefined && { logoUrl: updates.logoUrl }),
        ...(updates.website !== undefined && { website: updates.website }),
        ...(updates.description !== undefined && { description: updates.description }),
      },
      tenant.organizationId
    );

    if (!updated) return { success: false, error: 'Failed to update brand record' };

    const event: BusinessEvent = {
      id: `evt_brand_${Date.now()}`,
      eventType: 'brand.updated',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { brandId: updated.id, brandName: updated.name },
      correlationId: `corr_${Date.now()}_brand_upd`,
      status: 'processed',
    };

    return { success: true, data: updated, event };
  }

  static async deleteBrand(id: string, tenant: TenantContext): Promise<BrandActionResult> {
    const existing = await BrandRepository.getById(id, tenant.organizationId);
    if (!existing) return { success: false, error: 'Brand record not found' };

    const deleted = await BrandRepository.delete(id, tenant.organizationId);
    if (!deleted) return { success: false, error: 'Failed to delete brand' };

    const event: BusinessEvent = {
      id: `evt_brand_${Date.now()}`,
      eventType: 'brand.deleted',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { brandId: id, brandName: existing.name },
      correlationId: `corr_${Date.now()}_brand_del`,
      status: 'processed',
    };

    return { success: true, event };
  }
}
