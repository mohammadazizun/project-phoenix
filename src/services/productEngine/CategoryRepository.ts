/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Category Repository (In-Memory Tenant Isolation Data Layer)
 */

import { ProductCategory } from './types';

const INITIAL_CATEGORIES: ProductCategory[] = [
  {
    id: 'cat_hardware',
    organizationId: 'org_acme_corp',
    name: 'Computing & Server Hardware',
    code: 'HARDWARE',
    description: 'Enterprise server racks, motherboards, processors, and network appliances.',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'cat_networking',
    organizationId: 'org_acme_corp',
    name: 'Networking & Cabling',
    code: 'NETWORKING',
    description: 'High performance optical fibre, Cat8 Ethernet, and managed switches.',
    createdAt: '2026-01-15T09:30:00Z',
    updatedAt: '2026-01-15T09:30:00Z',
  },
  {
    id: 'cat_cooling',
    organizationId: 'org_acme_corp',
    name: 'Cryogenic & Thermal Systems',
    code: 'THERMAL',
    description: 'Server cooling systems, heat exchangers, liquid nitrogen units.',
    createdAt: '2026-02-01T11:00:00Z',
    updatedAt: '2026-02-01T11:00:00Z',
  },
  {
    id: 'cat_displays',
    organizationId: 'org_acme_corp',
    name: 'Displays & Peripherals',
    code: 'DISPLAYS',
    description: 'Ultra-wide curved operation monitors and multi-screen KVM units.',
    createdAt: '2026-02-15T14:20:00Z',
    updatedAt: '2026-02-15T14:20:00Z',
  },
  // Apex Retail tenant categories
  {
    id: 'cat_apex_cables',
    organizationId: 'org_apex_retail',
    name: 'Retail Electronics & Accessories',
    code: 'RETAIL_ELEC',
    description: 'Consumer grade power adapters, high speed cables, and peripheral packs.',
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
];

let categoryStore: ProductCategory[] = [...INITIAL_CATEGORIES];

export class CategoryRepository {
  static async getAll(organizationId: string): Promise<ProductCategory[]> {
    return categoryStore.filter(
      (c) => c.organizationId === organizationId && !c.deletedAt
    );
  }

  static async getById(id: string, organizationId: string): Promise<ProductCategory | null> {
    const category = categoryStore.find(
      (c) => c.id === id && c.organizationId === organizationId && !c.deletedAt
    );
    return category ? { ...category } : null;
  }

  static async getByCode(code: string, organizationId: string): Promise<ProductCategory | null> {
    const category = categoryStore.find(
      (c) =>
        c.code.toUpperCase() === code.toUpperCase() &&
        c.organizationId === organizationId &&
        !c.deletedAt
    );
    return category ? { ...category } : null;
  }

  static async create(category: ProductCategory): Promise<ProductCategory> {
    categoryStore.unshift(category);
    return { ...category };
  }

  static async update(
    id: string,
    updates: Partial<Omit<ProductCategory, 'id' | 'organizationId'>>,
    organizationId: string
  ): Promise<ProductCategory | null> {
    const idx = categoryStore.findIndex(
      (c) => c.id === id && c.organizationId === organizationId && !c.deletedAt
    );
    if (idx === -1) return null;

    categoryStore[idx] = {
      ...categoryStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return { ...categoryStore[idx] };
  }

  static async delete(id: string, organizationId: string): Promise<boolean> {
    const idx = categoryStore.findIndex(
      (c) => c.id === id && c.organizationId === organizationId && !c.deletedAt
    );
    if (idx === -1) return false;

    categoryStore[idx] = {
      ...categoryStore[idx],
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
}
