import { TimelineService } from './TimelineService';
import { ActivityRecord, EntityType, ActivityType } from './types';
import { TenantContext, CRMContact } from '../../types';

export class ActivityEngine {
  /**
   * Log a customer creation event
   */
  public static async logCustomerCreated(
    tenant: TenantContext,
    customer: CRMContact,
    actorName: string = 'User'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: customer.id,
      activityType: 'customer_created',
      title: 'Customer Account Created',
      description: `New customer "${customer.name}" (${customer.customerCode || 'Code Pending'}) created in ${customer.stage} stage.`,
      metadata: {
        customerCode: customer.customerCode,
        name: customer.name,
        company: customer.company,
        email: customer.email,
        stage: customer.stage,
        dealValue: customer.dealValue,
      },
      createdBy: actorName,
    });
  }

  /**
   * Log a customer update event
   */
  public static async logCustomerUpdated(
    tenant: TenantContext,
    customer: CRMContact,
    updatedFields: string[],
    actorName: string = 'User'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: customer.id,
      activityType: 'customer_updated',
      title: 'Customer Profile Updated',
      description: `Updated profile details for customer "${customer.name}". Modified: ${updatedFields.join(', ')}.`,
      metadata: {
        customerCode: customer.customerCode,
        name: customer.name,
        updatedFields,
        stage: customer.stage,
        dealValue: customer.dealValue,
      },
      createdBy: actorName,
    });
  }

  /**
   * Log a customer deletion event
   */
  public static async logCustomerDeleted(
    tenant: TenantContext,
    customer: CRMContact,
    actorName: string = 'User'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: customer.id,
      activityType: 'customer_deleted',
      title: 'Customer Marked Soft-Deleted',
      description: `Customer record "${customer.name}" (${customer.customerCode}) was archived or soft-deleted.`,
      metadata: {
        customerCode: customer.customerCode,
        name: customer.name,
        email: customer.email,
      },
      createdBy: actorName,
    });
  }

  /**
   * Log a customer import event
   */
  public static async logCustomerImported(
    tenant: TenantContext,
    count: number,
    fileName: string,
    actorName: string = 'Import Engine'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: 'batch_import',
      activityType: 'customer_imported',
      title: 'Batch Customer Import',
      description: `Successfully imported ${count} customer records from file "${fileName}".`,
      metadata: {
        importedCount: count,
        fileName,
      },
      createdBy: actorName,
    });
  }

  /**
   * Log a customer export event
   */
  public static async logCustomerExported(
    tenant: TenantContext,
    format: string,
    count: number,
    actorName: string = 'Export Engine'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: 'batch_export',
      activityType: 'customer_exported',
      title: 'Customer Records Exported',
      description: `Exported ${count} customer records to ${format.toUpperCase()} format.`,
      metadata: {
        format,
        exportedCount: count,
      },
      createdBy: actorName,
    });
  }

  /**
   * Log a receivable created event
   */
  public static async logReceivableCreated(
    tenant: TenantContext,
    receivable: { id: string; customerId: string; referenceNumber: string; amount: number; dueDate: string },
    actorName: string = 'Receivables Foundation'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: receivable.customerId,
      activityType: 'receivable_created',
      title: 'Customer Receivable Recorded',
      description: `New receivable ledger entry "${receivable.referenceNumber}" recorded with value $${receivable.amount.toLocaleString()}.`,
      metadata: {
        receivableId: receivable.id,
        referenceNumber: receivable.referenceNumber,
        amount: receivable.amount,
        dueDate: receivable.dueDate,
      },
      createdBy: actorName,
    });
  }

  /**
   * Log a receivable update event
   */
  public static async logReceivableUpdated(
    tenant: TenantContext,
    receivable: { id: string; customerId: string; referenceNumber: string; amount: number; status: string; paidAmount: number },
    actorName: string = 'Receivables Foundation'
  ): Promise<ActivityRecord> {
    return TimelineService.recordActivity({
      organizationId: tenant.organizationId,
      entityType: 'Customer',
      entityId: receivable.customerId,
      activityType: 'receivable_updated',
      title: 'Customer Receivable Updated',
      description: `Receivable "${receivable.referenceNumber}" updated. Status: ${receivable.status.toUpperCase()}, Paid: $${receivable.paidAmount.toLocaleString()}.`,
      metadata: {
        receivableId: receivable.id,
        referenceNumber: receivable.referenceNumber,
        status: receivable.status,
        amount: receivable.amount,
        paidAmount: receivable.paidAmount,
      },
      createdBy: actorName,
    });
  }
}
