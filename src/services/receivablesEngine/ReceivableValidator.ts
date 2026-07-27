import { CreateReceivableInput, UpdateReceivableInput } from './types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export class ReceivableValidator {
  /**
   * Validate new receivable payload
   */
  public static validateCreate(input: CreateReceivableInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.customerId || input.customerId.trim() === '') {
      errors.customerId = 'Customer ID is required.';
    }

    if (!input.referenceNumber || input.referenceNumber.trim() === '') {
      errors.referenceNumber = 'Reference number is required.';
    } else if (input.referenceNumber.length < 3) {
      errors.referenceNumber = 'Reference number must be at least 3 characters.';
    }

    if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
      errors.amount = 'Amount must be a positive number greater than 0.';
    }

    if (input.paidAmount !== undefined) {
      if (typeof input.paidAmount !== 'number' || isNaN(input.paidAmount) || input.paidAmount < 0) {
        errors.paidAmount = 'Paid amount cannot be negative.';
      } else if (input.paidAmount > input.amount) {
        errors.paidAmount = 'Paid amount cannot exceed total receivable amount.';
      }
    }

    if (!input.dueDate || input.dueDate.trim() === '') {
      errors.dueDate = 'Due date is required.';
    } else {
      const parsedDate = new Date(input.dueDate);
      if (isNaN(parsedDate.getTime())) {
        errors.dueDate = 'Due date must be a valid ISO date string.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate receivable update payload
   */
  public static validateUpdate(input: UpdateReceivableInput): ValidationResult {
    const errors: Record<string, string> = {};

    if (!input.id || input.id.trim() === '') {
      errors.id = 'Receivable ID is required for update.';
    }

    if (input.amount !== undefined) {
      if (typeof input.amount !== 'number' || isNaN(input.amount) || input.amount <= 0) {
        errors.amount = 'Amount must be a positive number greater than 0.';
      }
    }

    if (input.paidAmount !== undefined) {
      if (typeof input.paidAmount !== 'number' || isNaN(input.paidAmount) || input.paidAmount < 0) {
        errors.paidAmount = 'Paid amount cannot be negative.';
      }
    }

    if (input.dueDate !== undefined) {
      const parsedDate = new Date(input.dueDate);
      if (isNaN(parsedDate.getTime())) {
        errors.dueDate = 'Due date must be a valid date string.';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }
}
