/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Unit Repository (In-Memory Tenant Isolation Data Layer)
 */

import { ProductUnitRecord } from './types';

const INITIAL_UNITS: ProductUnitRecord[] = [
  { id: 'unit_pcs', organizationId: 'org_acme_corp', name: 'Pieces', code: 'PCS', symbol: 'pcs', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'unit_box', organizationId: 'org_acme_corp', name: 'Box', code: 'BOX', symbol: 'box', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'unit_set', organizationId: 'org_acme_corp', name: 'Set', code: 'SET', symbol: 'set', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'unit_unit', organizationId: 'org_acme_corp', name: 'Unit', code: 'UNIT', symbol: 'unt', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'unit_kg', organizationId: 'org_acme_corp', name: 'Kilogram', code: 'KG', symbol: 'kg', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'unit_pack', organizationId: 'org_acme_corp', name: 'Pack', code: 'PACK', symbol: 'pck', isSystem: false, createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
  
  // Apex
  { id: 'unit_apex_pcs', organizationId: 'org_apex_retail', name: 'Pieces', code: 'PCS', symbol: 'pcs', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
  { id: 'unit_apex_pack', organizationId: 'org_apex_retail', name: 'Pack', code: 'PACK', symbol: 'pck', isSystem: true, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
];

let unitStore: ProductUnitRecord[] = [...INITIAL_UNITS];

export class UnitRepository {
  static async getAll(organizationId: string): Promise<ProductUnitRecord[]> {
    return unitStore.filter((u) => u.organizationId === organizationId && !u.deletedAt);
  }

  static async getById(id: string, organizationId: string): Promise<ProductUnitRecord | null> {
    const unit = unitStore.find((u) => u.id === id && u.organizationId === organizationId && !u.deletedAt);
    return unit ? { ...unit } : null;
  }

  static async getByCode(code: string, organizationId: string): Promise<ProductUnitRecord | null> {
    const unit = unitStore.find(
      (u) => u.code.toUpperCase() === code.toUpperCase() && u.organizationId === organizationId && !u.deletedAt
    );
    return unit ? { ...unit } : null;
  }

  static async create(unit: ProductUnitRecord): Promise<ProductUnitRecord> {
    unitStore.unshift(unit);
    return { ...unit };
  }

  static async update(
    id: string,
    updates: Partial<Omit<ProductUnitRecord, 'id' | 'organizationId'>>,
    organizationId: string
  ): Promise<ProductUnitRecord | null> {
    const idx = unitStore.findIndex((u) => u.id === id && u.organizationId === organizationId && !u.deletedAt);
    if (idx === -1) return null;

    unitStore[idx] = {
      ...unitStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return { ...unitStore[idx] };
  }

  static async delete(id: string, organizationId: string): Promise<boolean> {
    const idx = unitStore.findIndex((u) => u.id === id && u.organizationId === organizationId && !u.deletedAt);
    if (idx === -1) return false;

    // Prevent system units from being deleted
    if (unitStore[idx].isSystem) {
      throw new Error('System measurement units cannot be deleted');
    }

    unitStore[idx] = {
      ...unitStore[idx],
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
}
