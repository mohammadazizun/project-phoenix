/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Unit Service Orchestrator (v3.5)
 */

import { BusinessEvent, TenantContext } from '../../types';
import { ProductUnitRecord } from './types';
import { UnitRepository } from './UnitRepository';
import { ProductValidator, UnitInputDTO } from './ProductValidator';

export interface UnitActionResult {
  success: boolean;
  data?: ProductUnitRecord;
  event?: BusinessEvent;
  error?: string;
  validationErrors?: string[];
}

export class UnitService {
  static async getUnits(organizationId: string): Promise<ProductUnitRecord[]> {
    return UnitRepository.getAll(organizationId);
  }

  static async createUnit(
    input: Partial<UnitInputDTO>,
    tenant: TenantContext
  ): Promise<UnitActionResult> {
    const rawPayload = {
      ...input,
      organizationId: tenant.organizationId,
    };

    const validation = ProductValidator.validateUnit(rawPayload);
    if (!validation.success) {
      return {
        success: false,
        error: 'Unit validation failed',
        validationErrors: 'errors' in validation ? validation.errors : [],
      };
    }

    const dto = validation.data;

    const existingCode = await UnitRepository.getByCode(dto.code, tenant.organizationId);
    if (existingCode) {
      return {
        success: false,
        error: `Unit code "${dto.code}" is already registered`,
      };
    }

    const record: ProductUnitRecord = {
      id: `unit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId: tenant.organizationId,
      name: dto.name,
      code: dto.code.toUpperCase(),
      symbol: dto.symbol,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const created = await UnitRepository.create(record);

    const event: BusinessEvent = {
      id: `evt_unit_${Date.now()}`,
      eventType: 'unit.created',
      timestamp: new Date().toISOString(),
      sourceCapability: 'cap_product_catalog',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: { unitId: created.id, unitName: created.name, unitCode: created.code },
      correlationId: `corr_${Date.now()}_unit`,
      status: 'processed',
    };

    return { success: true, data: created, event };
  }

  static async deleteUnit(id: string, tenant: TenantContext): Promise<UnitActionResult> {
    const existing = await UnitRepository.getById(id, tenant.organizationId);
    if (!existing) return { success: false, error: 'Unit record not found' };

    try {
      const deleted = await UnitRepository.delete(id, tenant.organizationId);
      if (!deleted) return { success: false, error: 'Failed to delete unit' };

      const event: BusinessEvent = {
        id: `evt_unit_${Date.now()}`,
        eventType: 'unit.deleted',
        timestamp: new Date().toISOString(),
        sourceCapability: 'cap_product_catalog',
        tenantId: tenant.organizationId,
        entityLocation: tenant.locationName,
        payload: { unitId: id, unitName: existing.name },
        correlationId: `corr_${Date.now()}_unit_del`,
        status: 'processed',
      };

      return { success: true, event };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error deleting unit' };
    }
  }
}
