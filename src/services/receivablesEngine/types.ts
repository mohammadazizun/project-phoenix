/**
 * PROJECT PHOENIX - CUSTOMER RECEIVABLES FOUNDATION
 * Type Definitions and Constants
 */

export type ReceivableStatus = 'draft' | 'open' | 'partially_paid' | 'paid' | 'cancelled';

export type ReferenceType = 'INVOICE' | 'MANUAL_ENTRY' | 'OPENING_BALANCE' | 'ORDER_ADVANCE';

export interface ReceivableRecord {
  id: string;
  organizationId: string;
  customerId: string;
  referenceNumber: string;
  referenceType: ReferenceType;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  status: ReceivableStatus;
  dueDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ReceivableSummary {
  totalOutstanding: number;
  totalOverdue: number;
  totalOpenCount: number;
  totalPaidAmount: number;
  byStatusCount: Record<ReceivableStatus, number>;
}

export interface ReceivableFilterOptions {
  customerId?: string;
  status?: ReceivableStatus | 'all';
  searchQuery?: string;
  isOverdueOnly?: boolean;
}

export interface CreateReceivableInput {
  customerId: string;
  referenceNumber: string;
  referenceType?: ReferenceType;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  notes?: string;
}

export interface UpdateReceivableInput {
  id: string;
  referenceNumber?: string;
  amount?: number;
  paidAmount?: number;
  dueDate?: string;
  status?: ReceivableStatus;
  notes?: string;
}

/**
 * Granular Receivables Permissions System
 */
export const RECEIVABLE_PERMISSIONS = {
  READ: 'receivables:read',
  CREATE: 'receivables:create',
  UPDATE: 'receivables:update',
  DELETE: 'receivables:delete',
  SUMMARY: 'receivables:summary',
} as const;

export type ReceivablePermission = typeof RECEIVABLE_PERMISSIONS[keyof typeof RECEIVABLE_PERMISSIONS];
