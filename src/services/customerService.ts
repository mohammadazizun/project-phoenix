import { CRMContact, BusinessEvent, TenantContext } from '../types';
import { CustomerRepository } from './customerRepository';
import { customerSchema, checkDuplicateCustomerCode, CustomerFormData } from './customerValidation';
import { ActivityEngine } from './timelineEngine/ActivityEngine';

export interface CustomerOperationResult {
  success: boolean;
  data?: CRMContact;
  error?: string;
  event?: BusinessEvent;
}

export class CustomerService {
  /**
   * Fetch all active non-deleted customers for tenant
   */
  public static async getCustomers(tenantId: string): Promise<CRMContact[]> {
    return CustomerRepository.getAll(tenantId);
  }

  /**
   * Create a new customer with validation & duplicate check
   */
  public static async createCustomer(
    formData: CustomerFormData,
    tenant: TenantContext,
    existingCustomers: CRMContact[]
  ): Promise<CustomerOperationResult> {
    try {
      // 1. Zod Validation
      const validatedData = customerSchema.parse(formData);

      // 2. Duplicate Code Check
      const duplicateError = checkDuplicateCustomerCode(
        validatedData.customerCode,
        tenant.organizationId,
        existingCustomers
      );

      if (duplicateError) {
        return { success: false, error: duplicateError };
      }

      // 3. Persist via Repository
      const newCustomer = await CustomerRepository.create(
        {
          customerCode: validatedData.customerCode.toUpperCase(),
          name: validatedData.name,
          company: validatedData.company || 'N/A',
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address || '',
          stage: validatedData.stage,
          status: validatedData.status || 'Active',
          dealValue: validatedData.dealValue,
          notes: validatedData.notes || '',
          lastInteraction: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
        tenant.organizationId
      );

      // Log Activity in Timeline Engine
      await ActivityEngine.logCustomerCreated(tenant, newCustomer);

      // 4. Construct Business Event
      const event: BusinessEvent = {
        id: `evt_crm_${Date.now()}`,
        eventType: 'crm.lead_created',
        timestamp: new Date().toISOString(),
        sourceCapability: 'cap_crm',
        tenantId: tenant.organizationId,
        entityLocation: tenant.locationName,
        payload: {
          customerId: newCustomer.id,
          customerCode: newCustomer.customerCode,
          name: newCustomer.name,
          company: newCustomer.company,
          dealValue: newCustomer.dealValue,
          stage: newCustomer.stage,
        },
        correlationId: `corr_crm_${Date.now()}`,
        status: 'processed',
      };

      return { success: true, data: newCustomer, event };
    } catch (err: any) {
      if (err.issues && Array.isArray(err.issues)) {
        const msg = err.issues.map((e: any) => e.message).join('. ');
        return { success: false, error: msg };
      }
      return { success: false, error: err.message || 'Failed to create customer.' };
    }
  }

  /**
   * Update existing customer with validation & duplicate check
   */
  public static async updateCustomer(
    customerId: string,
    formData: CustomerFormData,
    tenant: TenantContext,
    existingCustomers: CRMContact[]
  ): Promise<CustomerOperationResult> {
    try {
      // 1. Zod Validation
      const validatedData = customerSchema.parse(formData);

      // 2. Duplicate Code Check
      const duplicateError = checkDuplicateCustomerCode(
        validatedData.customerCode,
        tenant.organizationId,
        existingCustomers,
        customerId
      );

      if (duplicateError) {
        return { success: false, error: duplicateError };
      }

      // 3. Update via Repository
      const updatedCustomer = await CustomerRepository.update(
        customerId,
        {
          customerCode: validatedData.customerCode.toUpperCase(),
          name: validatedData.name,
          company: validatedData.company || 'N/A',
          email: validatedData.email,
          phone: validatedData.phone,
          address: validatedData.address || '',
          stage: validatedData.stage,
          status: validatedData.status,
          dealValue: validatedData.dealValue,
          notes: validatedData.notes || '',
          lastInteraction: new Date().toISOString().replace('T', ' ').substring(0, 16),
        },
        tenant.organizationId
      );

      // Log Activity in Timeline Engine
      await ActivityEngine.logCustomerUpdated(tenant, updatedCustomer, [
        'name',
        'stage',
        'status',
        'dealValue',
      ]);

      // 4. Construct Business Event
      const event: BusinessEvent = {
        id: `evt_crm_upd_${Date.now()}`,
        eventType: 'crm.contact_updated',
        timestamp: new Date().toISOString(),
        sourceCapability: 'cap_crm',
        tenantId: tenant.organizationId,
        entityLocation: tenant.locationName,
        payload: {
          customerId: updatedCustomer.id,
          customerCode: updatedCustomer.customerCode,
          name: updatedCustomer.name,
          stage: updatedCustomer.stage,
          status: updatedCustomer.status,
        },
        correlationId: `corr_crm_${Date.now()}`,
        status: 'processed',
      };

      return { success: true, data: updatedCustomer, event };
    } catch (err: any) {
      if (err.issues && Array.isArray(err.issues)) {
        const msg = err.issues.map((e: any) => e.message).join('. ');
        return { success: false, error: msg };
      }
      return { success: false, error: err.message || 'Failed to update customer.' };
    }
  }

  /**
   * Soft Delete customer
   */
  public static async softDeleteCustomer(
    customerId: string,
    tenant: TenantContext
  ): Promise<CustomerOperationResult> {
    try {
      const existing = (await CustomerRepository.getAll(tenant.organizationId)).find(
        (c) => c.id === customerId
      );
      await CustomerRepository.softDelete(customerId, tenant.organizationId);

      if (existing) {
        await ActivityEngine.logCustomerDeleted(tenant, existing);
      }

      const event: BusinessEvent = {
        id: `evt_crm_del_${Date.now()}`,
        eventType: 'crm.contact_deleted',
        timestamp: new Date().toISOString(),
        sourceCapability: 'cap_crm',
        tenantId: tenant.organizationId,
        entityLocation: tenant.locationName,
        payload: {
          customerId,
          action: 'soft_delete',
        },
        correlationId: `corr_crm_${Date.now()}`,
        status: 'processed',
      };

      return { success: true, event };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to delete customer.' };
    }
  }

  /**
   * Bulk import customer records with organization isolation and event emission
   */
  public static async importCustomers(
    candidates: Partial<CRMContact>[],
    tenant: TenantContext
  ): Promise<{ success: boolean; inserted: CRMContact[]; event?: BusinessEvent; error?: string }> {
    try {
      const inserted = await CustomerRepository.createMany(candidates, tenant.organizationId);

      // Log Activity in Timeline Engine
      await ActivityEngine.logCustomerImported(tenant, inserted.length, 'bulk_import.csv');

      const event: BusinessEvent = {
        id: `evt_crm_imp_${Date.now()}`,
        eventType: 'crm.contacts_imported',
        timestamp: new Date().toISOString(),
        sourceCapability: 'cap_crm',
        tenantId: tenant.organizationId,
        entityLocation: tenant.locationName,
        payload: {
          importedCount: inserted.length,
          customerCodes: inserted.map((c) => c.customerCode),
        },
        correlationId: `corr_crm_${Date.now()}`,
        status: 'processed',
      };

      return { success: true, inserted, event };
    } catch (err: any) {
      return { success: false, inserted: [], error: err.message || 'Failed to bulk import customers.' };
    }
  }
}
