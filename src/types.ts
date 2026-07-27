export type CapabilityStatus = 'active' | 'inactive' | 'beta' | 'deprecated';

export interface Capability {
  id: string;
  name: string;
  category: 'Core' | 'Business' | 'Extension' | 'Intelligence';
  version: string;
  status: CapabilityStatus;
  description: string;
  author: string;
  dependencies: string[];
  eventsEmitted: string[];
  eventsConsumed: string[];
  configOptions?: Record<string, any>;
}

export interface BusinessEvent {
  id: string;
  eventType: string;
  timestamp: string;
  sourceCapability: string;
  tenantId: string;
  entityLocation: string;
  payload: Record<string, any>;
  correlationId: string;
  status: 'processed' | 'pending' | 'failed';
}

export interface TenantContext {
  organizationId: string;
  organizationName: string;
  legalEntity: string;
  locationId: string;
  locationName: string;
  currency: string;
  taxNumber: string;
}

export interface SKU {
  id: string;
  skuCode: string;
  name: string;
  category: string;
  unitPrice: number;
  unitCost: number;
  stockLevels: Record<string, number>; // warehouseId -> quantity
  reorderThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  address: string;
}

export interface SalesOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  items: {
    skuId: string;
    skuName: string;
    quantity: number;
    unitPrice: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'Draft' | 'Confirmed' | 'Fulfilled' | 'Invoiced' | 'Cancelled';
  paymentMethod: 'Credit Card' | 'Wire Transfer' | 'POS Cash' | 'Net 30';
  warehouseId: string;
}

export interface LedgerAccount {
  id: string;
  accountCode: string;
  accountName: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  balance: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  referenceEventId?: string;
  status: 'Posted' | 'Pending';
}

export interface CRMContact {
  id: string;
  customerCode?: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address?: string;
  stage: 'Lead' | 'Contacted' | 'Proposal Sent' | 'Negotiation' | 'Customer' | 'Churned';
  status?: 'Active' | 'Inactive';
  dealValue: number;
  lastInteraction: string;
  notes: string;
  organizationId?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArchitectureLayer {
  name: string;
  color: string;
  description: string;
  components: string[];
  principles: string[];
}
