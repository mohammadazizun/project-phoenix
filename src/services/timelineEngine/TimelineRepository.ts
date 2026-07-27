import { ActivityRecord, EntityType } from './types';

export class TimelineRepository {
  private static store: ActivityRecord[] = [
    {
      id: 'act_seed_101',
      organizationId: 'org_main_001',
      entityType: 'Customer',
      entityId: 'cust_001',
      activityType: 'customer_created',
      title: 'Customer Account Created',
      description: 'Customer record initialized in CRM pipeline as Lead stage.',
      metadata: { customerCode: 'CUST-001', name: 'Ahmad Dahlan', stage: 'Lead', dealValue: 12500 },
      createdBy: 'System Auto-Init',
      createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'act_seed_102',
      organizationId: 'org_main_001',
      entityType: 'Customer',
      entityId: 'cust_001',
      activityType: 'customer_updated',
      title: 'Pipeline Stage Promoted',
      description: 'Customer stage updated from Lead to Negotiation.',
      metadata: { previousStage: 'Lead', newStage: 'Negotiation', updatedFields: ['stage', 'lastInteraction'] },
      createdBy: 'Sales Specialist',
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'act_seed_201',
      organizationId: 'org_main_001',
      entityType: 'Customer',
      entityId: 'cust_002',
      activityType: 'customer_created',
      title: 'Customer Account Created',
      description: 'Customer record created for Sinar Jaya Logistics.',
      metadata: { customerCode: 'CUST-002', name: 'Sinar Jaya Logistics', stage: 'Customer', dealValue: 45000 },
      createdBy: 'System Auto-Init',
      createdAt: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'act_seed_301',
      organizationId: 'org_main_001',
      entityType: 'Customer',
      entityId: 'cust_003',
      activityType: 'customer_imported',
      title: 'Bulk Customer Import',
      description: 'Record added via batch import execution.',
      metadata: { batchId: 'batch_0912', fileName: 'q2_contacts.xlsx' },
      createdBy: 'Data Admin',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  public static async getAll(
    organizationId: string,
    entityType?: EntityType,
    entityId?: string
  ): Promise<ActivityRecord[]> {
    return this.store.filter((act) => {
      if (act.isDeleted) return false;
      if (act.organizationId !== organizationId) return false;
      if (entityType && act.entityType !== entityType) return false;
      if (entityId && act.entityId !== entityId) return false;
      return true;
    });
  }

  public static async create(
    activity: Omit<ActivityRecord, 'id' | 'createdAt'>
  ): Promise<ActivityRecord> {
    const record: ActivityRecord = {
      ...activity,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    this.store.unshift(record);
    return record;
  }

  public static async delete(id: string): Promise<boolean> {
    const idx = this.store.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.store[idx].isDeleted = true;
      return true;
    }
    return false;
  }
}
