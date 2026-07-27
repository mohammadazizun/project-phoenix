import { ReceivableRecord, CreateReceivableInput, UpdateReceivableInput } from './types';
import { ReceivableMapper } from './ReceivableMapper';

export class ReceivableRepository {
  private static store: ReceivableRecord[] = [
    {
      id: 'rcv_seed_101',
      organizationId: 'org_main_001',
      customerId: 'cust_001',
      referenceNumber: 'INV-2026-001',
      referenceType: 'OPENING_BALANCE',
      amount: 4500.0,
      paidAmount: 1500.0,
      remainingAmount: 3000.0,
      status: 'partially_paid',
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
      notes: 'Initial opening balance transferred from legacy system.',
      createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'rcv_seed_102',
      organizationId: 'org_main_001',
      customerId: 'cust_001',
      referenceNumber: 'REF-MAN-102',
      referenceType: 'MANUAL_ENTRY',
      amount: 1250.0,
      paidAmount: 0.0,
      remainingAmount: 1250.0,
      status: 'open',
      dueDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), // Overdue
      notes: 'Manual receivables initialization for pending service fee.',
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'rcv_seed_201',
      organizationId: 'org_main_001',
      customerId: 'cust_002',
      referenceNumber: 'INV-2026-088',
      referenceType: 'OPENING_BALANCE',
      amount: 18500.0,
      paidAmount: 18500.0,
      remainingAmount: 0.0,
      status: 'paid',
      dueDate: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
      notes: 'Logistics SLA opening ledger item fully settled.',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'rcv_seed_202',
      organizationId: 'org_main_001',
      customerId: 'cust_002',
      referenceNumber: 'ORD-ADV-902',
      referenceType: 'ORDER_ADVANCE',
      amount: 6200.0,
      paidAmount: 0.0,
      remainingAmount: 6200.0,
      status: 'open',
      dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      notes: 'Advance commitment ledger for Q3 contract.',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    },
  ];

  /**
   * Get all active receivables for an organization, optionally filtered by customer
   */
  public static async getAll(
    organizationId: string,
    customerId?: string
  ): Promise<ReceivableRecord[]> {
    return this.store.filter((r) => {
      if (r.deletedAt) return false;
      if (r.organizationId !== organizationId) return false;
      if (customerId && r.customerId !== customerId) return false;
      return true;
    });
  }

  /**
   * Find single receivable by ID
   */
  public static async getById(
    id: string,
    organizationId: string
  ): Promise<ReceivableRecord | null> {
    const record = this.store.find(
      (r) => r.id === id && r.organizationId === organizationId && !r.deletedAt
    );
    return record || null;
  }

  /**
   * Create new receivable entry
   */
  public static async create(
    organizationId: string,
    input: CreateReceivableInput
  ): Promise<ReceivableRecord> {
    const amount = input.amount;
    const paidAmount = input.paidAmount || 0;
    const remainingAmount = Math.max(0, amount - paidAmount);
    const initialStatus = ReceivableMapper.deriveStatus('open', amount, paidAmount);

    const newRecord: ReceivableRecord = {
      id: `rcv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      organizationId,
      customerId: input.customerId,
      referenceNumber: input.referenceNumber,
      referenceType: input.referenceType || 'MANUAL_ENTRY',
      amount,
      paidAmount,
      remainingAmount,
      status: initialStatus,
      dueDate: input.dueDate,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    this.store.unshift(newRecord);
    return newRecord;
  }

  /**
   * Update existing receivable entry
   */
  public static async update(
    organizationId: string,
    input: UpdateReceivableInput
  ): Promise<ReceivableRecord | null> {
    const index = this.store.findIndex(
      (r) => r.id === input.id && r.organizationId === organizationId && !r.deletedAt
    );

    if (index === -1) return null;

    const existing = this.store[index];
    const amount = input.amount !== undefined ? input.amount : existing.amount;
    const paidAmount = input.paidAmount !== undefined ? input.paidAmount : existing.paidAmount;
    const remainingAmount = Math.max(0, amount - paidAmount);

    let status = input.status || existing.status;
    status = ReceivableMapper.deriveStatus(status, amount, paidAmount);

    const updatedRecord: ReceivableRecord = {
      ...existing,
      referenceNumber: input.referenceNumber || existing.referenceNumber,
      amount,
      paidAmount,
      remainingAmount,
      status,
      dueDate: input.dueDate || existing.dueDate,
      notes: input.notes !== undefined ? input.notes : existing.notes,
      updatedAt: new Date().toISOString(),
    };

    this.store[index] = updatedRecord;
    return updatedRecord;
  }

  /**
   * Soft delete receivable entry
   */
  public static async softDelete(id: string, organizationId: string): Promise<boolean> {
    const record = await this.getById(id, organizationId);
    if (!record) return false;

    record.deletedAt = new Date().toISOString();
    record.updatedAt = new Date().toISOString();
    return true;
  }
}
