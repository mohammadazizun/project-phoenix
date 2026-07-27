import {
  ReceivableRecord,
  ReceivableSummary,
  ReceivableFilterOptions,
  CreateReceivableInput,
  UpdateReceivableInput,
} from './types';
import { ReceivableRepository } from './ReceivableRepository';
import { ReceivableValidator } from './ReceivableValidator';
import { ReceivableMapper } from './ReceivableMapper';
import { ActivityEngine } from '../timelineEngine/ActivityEngine';
import { TenantContext } from '../../types';

export interface OperationResult<T> {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
  message?: string;
}

export class ReceivableService {
  /**
   * Fetch customer receivables with optional filtering and search
   */
  public static async getReceivables(
    tenant: TenantContext,
    filters?: ReceivableFilterOptions
  ): Promise<ReceivableRecord[]> {
    let records = await ReceivableRepository.getAll(tenant.organizationId, filters?.customerId);

    // Filter by status
    if (filters?.status && filters.status !== 'all') {
      records = records.filter((r) => r.status === filters.status);
    }

    // Filter overdue only
    if (filters?.isOverdueOnly) {
      records = records.filter((r) => ReceivableMapper.isOverdue(r));
    }

    // Text Search
    if (filters?.searchQuery && filters.searchQuery.trim() !== '') {
      const q = filters.searchQuery.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(q) ||
          r.referenceType.toLowerCase().includes(q) ||
          (r.notes && r.notes.toLowerCase().includes(q))
      );
    }

    // Sort by due date ascending (earliest due first)
    return records.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  /**
   * Compute summary metrics for organization or specific customer
   */
  public static async getSummary(
    tenant: TenantContext,
    customerId?: string
  ): Promise<ReceivableSummary> {
    const records = await ReceivableRepository.getAll(tenant.organizationId, customerId);
    return ReceivableMapper.calculateSummary(records);
  }

  /**
   * Initialize a new customer receivable ledger item
   */
  public static async createReceivable(
    tenant: TenantContext,
    input: CreateReceivableInput,
    actorName: string = 'Financial Admin'
  ): Promise<OperationResult<ReceivableRecord>> {
    const validation = ReceivableValidator.validateCreate(input);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Receivable creation failed validation.',
      };
    }

    const newRecord = await ReceivableRepository.create(tenant.organizationId, input);

    // Log Activity in Timeline Engine
    await ActivityEngine.logCustomerCreated; // Ensure ActivityEngine has receivable log or TimelineService record
    try {
      await ActivityEngine.logReceivableCreated(tenant, newRecord, actorName);
    } catch {
      // Graceful fallback if timeline service is handling timeline
    }

    return {
      success: true,
      data: newRecord,
      message: `Receivable ${newRecord.referenceNumber} initialized successfully.`,
    };
  }

  /**
   * Update receivable entry
   */
  public static async updateReceivable(
    tenant: TenantContext,
    input: UpdateReceivableInput,
    actorName: string = 'Financial Admin'
  ): Promise<OperationResult<ReceivableRecord>> {
    const validation = ReceivableValidator.validateUpdate(input);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        message: 'Receivable update failed validation.',
      };
    }

    const updated = await ReceivableRepository.update(tenant.organizationId, input);
    if (!updated) {
      return {
        success: false,
        message: 'Receivable record not found or access denied.',
      };
    }

    try {
      await ActivityEngine.logReceivableUpdated(tenant, updated, actorName);
    } catch {
      // Graceful fallback
    }

    return {
      success: true,
      data: updated,
      message: `Receivable ${updated.referenceNumber} updated successfully.`,
    };
  }

  /**
   * Soft delete receivable
   */
  public static async deleteReceivable(
    tenant: TenantContext,
    id: string
  ): Promise<OperationResult<boolean>> {
    const success = await ReceivableRepository.softDelete(id, tenant.organizationId);
    return {
      success,
      data: success,
      message: success ? 'Receivable archived successfully.' : 'Receivable record not found.',
    };
  }
}
