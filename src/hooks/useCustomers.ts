import { useState, useEffect, useCallback } from 'react';
import { CRMContact, BusinessEvent, TenantContext } from '../types';
import { CustomerService } from '../services/customerService';
import { CustomerRepository } from '../services/customerRepository';
import { CustomerFormData } from '../services/customerValidation';

export function useCustomers(
  tenant: TenantContext,
  initialContacts: CRMContact[],
  onEmitEvent?: (event: BusinessEvent) => void
) {
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize repository with base dataset if needed
  useEffect(() => {
    CustomerRepository.initializeStore(initialContacts);
  }, [initialContacts]);

  // Load customers for current tenant
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await CustomerService.getCustomers(tenant.organizationId);
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load customer records.');
    } finally {
      setLoading(false);
    }
  }, [tenant.organizationId]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Create Customer with Optimistic Update
  const addCustomer = async (formData: CustomerFormData): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const result = await CustomerService.createCustomer(formData, tenant, contacts);

    if (result.success && result.data) {
      setContacts((prev) => [result.data!, ...prev]);
      if (result.event && onEmitEvent) {
        onEmitEvent(result.event);
      }
      return { success: true };
    } else {
      setError(result.error || 'Validation failed');
      return { success: false, error: result.error };
    }
  };

  // Update Customer
  const updateCustomer = async (
    id: string,
    formData: CustomerFormData
  ): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const result = await CustomerService.updateCustomer(id, formData, tenant, contacts);

    if (result.success && result.data) {
      setContacts((prev) => prev.map((c) => (c.id === id ? result.data! : c)));
      if (result.event && onEmitEvent) {
        onEmitEvent(result.event);
      }
      return { success: true };
    } else {
      setError(result.error || 'Validation failed');
      return { success: false, error: result.error };
    }
  };

  // Delete Customer (Soft Delete)
  const deleteCustomer = async (id: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    const result = await CustomerService.softDeleteCustomer(id, tenant);

    if (result.success) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
      if (result.event && onEmitEvent) {
        onEmitEvent(result.event);
      }
      return { success: true };
    } else {
      setError(result.error || 'Delete failed');
      return { success: false, error: result.error };
    }
  };

  // Bulk Import Customers
  const bulkImportCustomers = async (
    candidates: Partial<CRMContact>[]
  ): Promise<{ success: boolean; inserted: CRMContact[]; error?: string }> => {
    setError(null);
    const result = await CustomerService.importCustomers(candidates, tenant);

    if (result.success && result.inserted.length > 0) {
      setContacts((prev) => [...result.inserted, ...prev]);
      if (result.event && onEmitEvent) {
        onEmitEvent(result.event);
      }
    }

    return result;
  };

  return {
    contacts,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    bulkImportCustomers,
    refresh: loadCustomers,
  };
}
