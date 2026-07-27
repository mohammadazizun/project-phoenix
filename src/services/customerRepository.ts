import { CRMContact } from '../types';

/**
 * CustomerRepository - Enterprise repository layer for Customer entity
 * Enforces organization boundary isolation and soft delete semantics.
 */
export class CustomerRepository {
  private static store: CRMContact[] = [];

  public static initializeStore(initialData: CRMContact[]) {
    if (this.store.length === 0) {
      this.store = [...initialData];
    }
  }

  public static async getAll(organizationId: string): Promise<CRMContact[]> {
    // Simulate async DB query with Row Level Security (RLS) & Organization Isolation
    return this.store.filter(
      (c) => !c.isDeleted && (c.organizationId === organizationId || !c.organizationId)
    );
  }

  public static async getById(id: string, organizationId: string): Promise<CRMContact | null> {
    const customer = this.store.find(
      (c) => c.id === id && !c.isDeleted && (c.organizationId === organizationId || !c.organizationId)
    );
    return customer || null;
  }

  public static async create(
    customer: Omit<CRMContact, 'id' | 'createdAt' | 'updatedAt'>,
    organizationId: string
  ): Promise<CRMContact> {
    const now = new Date().toISOString();
    const formattedLastInteraction = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newCustomer: CRMContact = {
      ...customer,
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      organizationId,
      isDeleted: false,
      status: customer.status || 'Active',
      createdAt: now,
      updatedAt: now,
      lastInteraction: customer.lastInteraction || formattedLastInteraction,
    };

    this.store.unshift(newCustomer);
    return newCustomer;
  }

  public static async createMany(
    customers: Partial<CRMContact>[],
    organizationId: string
  ): Promise<CRMContact[]> {
    const now = new Date().toISOString();
    const formattedLastInteraction = now.replace('T', ' ').substring(0, 16);

    const insertedRecords: CRMContact[] = customers.map((c, idx) => ({
      id: `cust_imp_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      customerCode: (c.customerCode || `CUST-${1000 + idx}`).toUpperCase(),
      name: c.name || 'Unnamed Customer',
      company: c.company || 'N/A',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      stage: c.stage || 'Lead',
      status: c.status || 'Active',
      dealValue: c.dealValue || 0,
      notes: c.notes || 'Imported via engine',
      organizationId,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
      lastInteraction: c.lastInteraction || formattedLastInteraction,
    }));

    // Prepend imported records to repository store
    this.store.unshift(...insertedRecords);
    return insertedRecords;
  }

  public static async update(
    id: string,
    updates: Partial<Omit<CRMContact, 'id' | 'createdAt'>>,
    organizationId: string
  ): Promise<CRMContact> {
    const index = this.store.findIndex(
      (c) => c.id === id && !c.isDeleted && (c.organizationId === organizationId || !c.organizationId)
    );

    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found or unauthorized for organization ${organizationId}.`);
    }

    const now = new Date().toISOString();
    const updatedCustomer: CRMContact = {
      ...this.store[index],
      ...updates,
      updatedAt: now,
    };

    this.store[index] = updatedCustomer;
    return updatedCustomer;
  }

  public static async softDelete(id: string, organizationId: string): Promise<boolean> {
    const index = this.store.findIndex(
      (c) => c.id === id && (c.organizationId === organizationId || !c.organizationId)
    );

    if (index === -1) {
      throw new Error(`Customer with ID ${id} not found or unauthorized.`);
    }

    this.store[index] = {
      ...this.store[index],
      isDeleted: true,
      status: 'Inactive',
      updatedAt: new Date().toISOString(),
    };

    return true;
  }
}
