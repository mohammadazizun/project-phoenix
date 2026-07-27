/**
 * Generic Reusable Activity & Timeline Engine Type Definitions
 * Prepared for enterprise multi-module extension (Customer, Product, Inventory, Sales, etc.)
 */

export type EntityType =
  | 'Customer'
  | 'Product'
  | 'Inventory'
  | 'Sale'
  | 'Purchase'
  | 'Finance'
  | 'AI'
  | 'System';

export type ActivityType =
  // Customer Activities
  | 'customer_created'
  | 'customer_updated'
  | 'customer_deleted'
  | 'customer_imported'
  | 'customer_exported'
  // Receivable Activities
  | 'receivable_created'
  | 'receivable_updated'
  // Future Ready Activities (Prepared for future capability modules)
  | 'sale_created'
  | 'invoice_created'
  | 'payment_received'
  | 'stock_updated'
  | 'purchase_created'
  | 'ai_recommendation';

export interface ActivityRecord {
  id: string;
  organizationId: string;
  entityType: EntityType;
  entityId: string;
  activityType: ActivityType;
  title: string;
  description: string;
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: string;
  isDeleted?: boolean;
}

export interface TimelineFilterOptions {
  entityType?: EntityType;
  entityId?: string;
  activityType?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
