/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Catalog Foundation Zod Validation Schemas & Validators (v3.5)
 */

import { z } from 'zod';

export const categorySchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(2, 'Category Name must be at least 2 characters').max(255),
  code: z
    .string()
    .min(2, 'Category Code must be at least 2 characters')
    .max(64)
    .regex(/^[A-Za-z0-9-_.]+$/, 'Code may only contain alphanumeric characters, hyphens, and underscores'),
  description: z.string().max(1000).optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const brandSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(2, 'Brand Name must be at least 2 characters').max(255),
  code: z
    .string()
    .min(2, 'Brand Code must be at least 2 characters')
    .max(64)
    .regex(/^[A-Za-z0-9-_.]+$/, 'Code may only contain alphanumeric characters, hyphens, and underscores'),
  logoUrl: z.string().url('Invalid Logo URL').optional().nullable().or(z.literal('')),
  website: z.string().url('Invalid Website URL').optional().nullable().or(z.literal('')),
  description: z.string().max(1000).optional().nullable(),
});

export const unitSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(2, 'Unit Name must be at least 2 characters').max(100),
  code: z.string().min(1, 'Unit Code is required').max(32),
  symbol: z.string().min(1, 'Symbol is required').max(16),
  isSystem: z.boolean().default(false),
});

export const imageSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  url: z.string().url('Must be a valid URL or image path'),
  isPrimary: z.boolean().default(false),
  altText: z.string().max(255).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
});

export const tagSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  name: z.string().min(1, 'Tag Name is required').max(100),
  color: z.string().default('indigo'),
});

export const catalogSettingsSchema = z.object({
  allowDiscounts: z.boolean().default(true),
  isTaxable: z.boolean().default(true),
  taxRate: z.number().min(0, 'Tax rate cannot be negative').max(100, 'Tax rate cannot exceed 100%').default(10),
  trackSerialNumbers: z.boolean().default(false),
  barcodeType: z.enum(['EAN-13', 'UPC-A', 'CODE-128', 'QR']).default('EAN-13'),
  allowBackorders: z.boolean().default(false),
  defaultLeadTimeDays: z.number().min(0).default(7),
});

export const productSchema = z.object({
  organizationId: z.string().min(1, 'Organization ID is required'),
  sku: z
    .string()
    .min(3, 'SKU must be at least 3 characters')
    .max(100, 'SKU cannot exceed 100 characters')
    .regex(/^[A-Za-z0-9-_.]+$/, 'SKU may only contain alphanumeric characters, hyphens, underscores, and dots'),
  barcode: z
    .string()
    .max(100, 'Barcode cannot exceed 100 characters')
    .optional()
    .nullable(),
  productName: z
    .string()
    .min(2, 'Product Name must be at least 2 characters')
    .max(255, 'Product Name cannot exceed 255 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().nullable(),
  unit: z.string().min(1, 'Unit is required').max(32, 'Unit code too long'),
  basePrice: z.number().min(0, 'Base Price cannot be negative'),
  sellingPrice: z.number().min(0, 'Selling Price cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum Stock cannot be negative'),
  status: z.enum(['active', 'inactive', 'archived', 'draft']),

  // Supporting Catalog Fields
  categoryId: z.string().optional().nullable(),
  brandId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  settings: catalogSettingsSchema.optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional().default({}),
}).refine((data) => data.sellingPrice >= data.basePrice, {
  message: 'Selling Price should generally be greater than or equal to Base Price',
  path: ['sellingPrice'],
});

export type CategoryInputDTO = z.infer<typeof categorySchema>;
export type BrandInputDTO = z.infer<typeof brandSchema>;
export type UnitInputDTO = z.infer<typeof unitSchema>;
export type ImageInputDTO = z.infer<typeof imageSchema>;
export type TagInputDTO = z.infer<typeof tagSchema>;
export type ProductInputDTO = z.infer<typeof productSchema>;

export class ProductValidator {
  static validateProduct(input: unknown) {
    const result = productSchema.safeParse(input);
    if (result.success) return { success: true as const, data: result.data };
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false as const, errors };
  }

  // Alias for backward compatibility
  static validate(input: unknown) {
    return ProductValidator.validateProduct(input);
  }

  static validateCategory(input: unknown) {
    const result = categorySchema.safeParse(input);
    if (result.success) return { success: true as const, data: result.data };
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false as const, errors };
  }

  static validateBrand(input: unknown) {
    const result = brandSchema.safeParse(input);
    if (result.success) return { success: true as const, data: result.data };
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false as const, errors };
  }

  static validateUnit(input: unknown) {
    const result = unitSchema.safeParse(input);
    if (result.success) return { success: true as const, data: result.data };
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false as const, errors };
  }

  static validateImage(input: unknown) {
    const result = imageSchema.safeParse(input);
    if (result.success) return { success: true as const, data: result.data };
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false as const, errors };
  }

  static validateTag(input: unknown) {
    const result = tagSchema.safeParse(input);
    if (result.success) return { success: true as const, data: result.data };
    const errors = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`);
    return { success: false as const, errors };
  }

  static isValidSku(sku: string): boolean {
    return /^[A-Za-z0-9-_.]{3,100}$/.test(sku);
  }

  static isValidPricing(basePrice: number, sellingPrice: number): boolean {
    return basePrice >= 0 && sellingPrice >= 0;
  }
}
