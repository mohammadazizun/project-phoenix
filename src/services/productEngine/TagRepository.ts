/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Tag Repository (In-Memory Tenant Isolation Data Layer)
 */

import { ProductTag } from './types';

const INITIAL_TAGS: ProductTag[] = [
  { id: 'tag_1', organizationId: 'org_acme_corp', name: 'High Margin', color: 'emerald', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag_2', organizationId: 'org_acme_corp', name: 'Critical Spare', color: 'rose', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag_3', organizationId: 'org_acme_corp', name: 'Enterprise Only', color: 'indigo', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag_4', organizationId: 'org_acme_corp', name: 'Fast Moving', color: 'amber', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag_5', organizationId: 'org_acme_corp', name: 'Discontinued Soon', color: 'slate', createdAt: '2026-01-01T00:00:00Z' },
  // Apex
  { id: 'tag_apex_1', organizationId: 'org_apex_retail', name: 'Best Seller', color: 'emerald', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'tag_apex_2', organizationId: 'org_apex_retail', name: 'Clearance', color: 'rose', createdAt: '2026-01-01T00:00:00Z' },
];

let tagStore: ProductTag[] = [...INITIAL_TAGS];

export class TagRepository {
  static async getAll(organizationId: string): Promise<ProductTag[]> {
    return tagStore.filter((t) => t.organizationId === organizationId);
  }

  static async getByName(name: string, organizationId: string): Promise<ProductTag | null> {
    const tag = tagStore.find(
      (t) => t.name.toLowerCase() === name.toLowerCase() && t.organizationId === organizationId
    );
    return tag ? { ...tag } : null;
  }

  static async create(tag: ProductTag): Promise<ProductTag> {
    tagStore.unshift(tag);
    return { ...tag };
  }

  static async delete(id: string, organizationId: string): Promise<boolean> {
    const idx = tagStore.findIndex((t) => t.id === id && t.organizationId === organizationId);
    if (idx === -1) return false;
    tagStore.splice(idx, 1);
    return true;
  }
}
