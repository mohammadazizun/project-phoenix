/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Tag Service Orchestrator (v3.5)
 */

import { BusinessEvent, TenantContext } from '../../types';
import { ProductTag } from './types';
import { TagRepository } from './TagRepository';
import { ProductValidator, TagInputDTO } from './ProductValidator';

export interface TagActionResult {
  success: boolean;
  data?: ProductTag;
  event?: BusinessEvent;
  error?: string;
}

export class TagService {
  static async getTags(organizationId: string): Promise<ProductTag[]> {
    return TagRepository.getAll(organizationId);
  }

  static async createTag(
    input: Partial<TagInputDTO>,
    tenant: TenantContext
  ): Promise<TagActionResult> {
    const rawPayload = {
      ...input,
      organizationId: tenant.organizationId,
    };

    const validation = ProductValidator.validateTag(rawPayload);
    if (!validation.success) {
      return { success: false, error: validation.errors[0] || 'Tag validation failed' };
    }

    const dto = validation.data;

    const existing = await TagRepository.getByName(dto.name, tenant.organizationId);
    if (existing) {
      return { success: true, data: existing };
    }

    const record: ProductTag = {
      id: `tag_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: tenant.organizationId,
      name: dto.name,
      color: dto.color || 'indigo',
      createdAt: new Date().toISOString(),
    };

    const created = await TagRepository.create(record);

    const event: BusinessEvent = {
      id: `evt_tag_${Date.now()}`,
      eventType: 'tag.created',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { tagId: created.id, tagName: created.name },
      correlationId: `corr_${Date.now()}_tag`,
      status: 'processed',
    };

    return { success: true, data: created, event };
  }

  static async deleteTag(id: string, tenant: TenantContext): Promise<TagActionResult> {
    const deleted = await TagRepository.delete(id, tenant.organizationId);
    if (!deleted) return { success: false, error: 'Failed to delete tag' };

    const event: BusinessEvent = {
      id: `evt_tag_${Date.now()}`,
      eventType: 'tag.deleted',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { tagId: id },
      correlationId: `corr_${Date.now()}_tag_del`,
      status: 'processed',
    };

    return { success: true, event };
  }
}
