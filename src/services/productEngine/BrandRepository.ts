/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Brand Repository (In-Memory Tenant Isolation Data Layer)
 */

import { ProductBrand } from './types';

const INITIAL_BRANDS: ProductBrand[] = [
  {
    id: 'brand_phoenix',
    organizationId: 'org_acme_corp',
    name: 'Phoenix Core',
    code: 'PHX',
    logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
    website: 'https://phoenix.acme.corp',
    description: 'Flagship enterprise hardware and industrial workstation equipment.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'brand_quantum',
    organizationId: 'org_acme_corp',
    name: 'Quantum Thermal',
    code: 'QTM',
    logoUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80',
    website: 'https://quantum-cooling.com',
    description: 'Precision cryogenic and fluid heat synchronization engineering.',
    createdAt: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
  },
  {
    id: 'brand_hyperion',
    organizationId: 'org_acme_corp',
    name: 'Hyperion Displays',
    code: 'HYP',
    logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=100&auto=format&fit=crop&q=80',
    website: 'https://hyperion-vis.io',
    description: 'High-density IPS curved glass displays for control rooms.',
    createdAt: '2026-03-01T12:00:00Z',
    updatedAt: '2026-03-01T12:00:00Z',
  },
  {
    id: 'brand_apex',
    organizationId: 'org_apex_retail',
    name: 'Apex Pro Tech',
    code: 'APEX',
    logoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100&auto=format&fit=crop&q=80',
    website: 'https://apexretail.com',
    description: 'Durable retail consumer electronics and wiring accessories.',
    createdAt: '2026-03-15T09:00:00Z',
    updatedAt: '2026-03-15T09:00:00Z',
  },
];

let brandStore: ProductBrand[] = [...INITIAL_BRANDS];

export class BrandRepository {
  static async getAll(organizationId: string): Promise<ProductBrand[]> {
    return brandStore.filter((b) => b.organizationId === organizationId && !b.deletedAt);
  }

  static async getById(id: string, organizationId: string): Promise<ProductBrand | null> {
    const brand = brandStore.find((b) => b.id === id && b.organizationId === organizationId && !b.deletedAt);
    return brand ? { ...brand } : null;
  }

  static async getByCode(code: string, organizationId: string): Promise<ProductBrand | null> {
    const brand = brandStore.find(
      (b) => b.code.toUpperCase() === code.toUpperCase() && b.organizationId === organizationId && !b.deletedAt
    );
    return brand ? { ...brand } : null;
  }

  static async create(brand: ProductBrand): Promise<ProductBrand> {
    brandStore.unshift(brand);
    return { ...brand };
  }

  static async update(
    id: string,
    updates: Partial<Omit<ProductBrand, 'id' | 'organizationId'>>,
    organizationId: string
  ): Promise<ProductBrand | null> {
    const idx = brandStore.findIndex((b) => b.id === id && b.organizationId === organizationId && !b.deletedAt);
    if (idx === -1) return null;

    brandStore[idx] = {
      ...brandStore[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return { ...brandStore[idx] };
  }

  static async delete(id: string, organizationId: string): Promise<boolean> {
    const idx = brandStore.findIndex((b) => b.id === id && b.organizationId === organizationId && !b.deletedAt);
    if (idx === -1) return false;

    brandStore[idx] = {
      ...brandStore[idx],
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return true;
  }
}
