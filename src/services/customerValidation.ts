import { z } from 'zod';
import { CRMContact } from '../types';

export const customerSchema = z.object({
  customerCode: z
    .string()
    .min(2, 'Customer code must be at least 2 characters')
    .max(20, 'Customer code must not exceed 20 characters')
    .regex(/^[A-Za-z0-9\-_]+$/, 'Code can only contain alphanumeric characters, hyphens, and underscores'),
  name: z
    .string()
    .min(2, 'Customer name must be at least 2 characters')
    .max(100, 'Customer name must not exceed 100 characters'),
  company: z
    .string()
    .max(100, 'Company name must not exceed 100 characters')
    .optional()
    .default(''),
  email: z
    .string()
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(6, 'Phone number must be at least 6 characters')
    .max(30, 'Phone number must not exceed 30 characters'),
  address: z
    .string()
    .max(250, 'Address must not exceed 250 characters')
    .optional()
    .default(''),
  stage: z.enum(['Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Customer', 'Churned']),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  dealValue: z
    .number()
    .min(0, 'Deal value cannot be negative'),
  notes: z
    .string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .default(''),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

export function checkDuplicateCustomerCode(
  customerCode: string,
  organizationId: string,
  allCustomers: CRMContact[],
  currentCustomerId?: string
): string | null {
  const normalizedCode = customerCode.trim().toUpperCase();
  const existing = allCustomers.find(
    (c) =>
      !c.isDeleted &&
      (c.organizationId === organizationId || !c.organizationId) &&
      c.customerCode?.toUpperCase() === normalizedCode &&
      c.id !== currentCustomerId
  );

  if (existing) {
    return `Customer code "${customerCode}" is already in use by ${existing.name}.`;
  }

  return null;
}
