/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Category Service Orchestrator (v3.5)
 */

import { BusinessEvent, TenantContext } from '../../types';
import { ProductCategory } from './types';
import { CategoryRepository } from './CategoryRepository';
import { ProductValidator, CategoryInputDTO } from './ProductValidator';

export interface CategoryActionResult {
  success: boolean;
  data?: ProductCategory;
  event?: BusinessEvent;
  error?: string;
  validationErrors?: string[];
}

export class CategoryService {
  static async getCategories(organizationId: string): Promise<ProductCategory[]> {
    return CategoryRepository.getAll(organizationId);
  }

  static async getCategoryById(id: string, organizationId: string): Promise<ProductCategory | null> {
    return CategoryRepository.getById(id, organizationId);
  }

  static async createCategory(
    input: Partial<CategoryInputDTO>,
    tenant: TenantContext
  ): Promise<CategoryActionResult> {
    const rawPayload = {
      ...input,
      organizationId: tenant.organizationId,
    };

    const validation = ProductValidator.validateCategory(rawPayload);
    if (!validation.success) {
      return {
        success: false,
        error: 'Category validation failed',
        validationErrors: 'errors' in validation ? validation.errors : [],
      };
    }

    const dto = validation.data;

    // Check code uniqueness
    const existingCode = await CategoryRepository.getByCode(dto.code, tenant.organizationId);
    if (existingCode) {
      return {
        success: false,
        error: `Category code "${dto.code}" is already registered in this organization`,
      };
    }

    const record: ProductCategory = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: tenant.organizationId,
      name: dto.name,
      code: dto.code.toUpperCase(),
      description: dto.description || null,
      parentId: dto.parentId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await CategoryRepository.create(record);

    const event: BusinessEvent = {
      id: `evt_cat_${Date.now()}`,
      eventType: 'category.created',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        categoryId: created.id,
        categoryName: created.name,
        categoryCode: created.code,
      },
      correlationId: `corr_${Date.now()}_cat`,
      status: 'processed',
    };

    return {
      success: true,
      data: created,
      event,
    };
  }

  static async updateCategory(
    id: string,
    updates: Partial<CategoryInputDTO>,
    tenant: TenantContext
  ): Promise<CategoryActionResult> {
    const existing = await CategoryRepository.getById(id, tenant.organizationId);
    if (!existing) {
      return { success: false, error: 'Category record not found' };
    }

    if (updates.code && updates.code.toUpperCase() !== existing.code) {
      const existingCode = await CategoryRepository.getByCode(updates.code, tenant.organizationId);
      if (existingCode) {
        return {
          success: false,
          error: `Category code "${updates.code}" is already registered`,
        };
      }
    }

    const updated = await CategoryRepository.update(
      id,
      {
        ...(updates.name && { name: updates.name }),
        ...(updates.code && { code: updates.code.toUpperCase() }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.parentId !== undefined && { parentId: updates.parentId }),
      },
      tenant.organizationId
    );

    if (!updated) return { success: false, error: 'Failed to update category record' };

    const event: BusinessEvent = {
      id: `evt_cat_${Date.now()}`,
      eventType: 'category.updated',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { categoryId: updated.id, categoryName: updated.name },
      correlationId: `corr_${Date.now()}_cat_upd`,
      status: 'processed',
    };

    return { success: true, data: updated, event };
  }

  static async deleteCategory(id: string, tenant: TenantContext): Promise<CategoryActionResult> {
    const existing = await CategoryRepository.getById(id, tenant.organizationId);
    if (!existing) return { success: false, error: 'Category record not found' };

    const deleted = await CategoryRepository.delete(id, tenant.organizationId);
    if (!deleted) return { success: false, error: 'Failed to delete category' };

    const event: BusinessEvent = {
      id: `evt_cat_${Date.now()}`,
      eventType: 'category.deleted',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { categoryId: id, categoryName: existing.name },
      correlationId: `corr_${Date.now()}_cat_del`,
      status: 'processed',
    };

    return { success: true, event };
  }
}
