/**
 * Generic Reusable Import/Export Engine Type Definitions
 * Designed for enterprise modularity (Customer, Products, Inventory, Sales, etc.)
 */

export type FieldType = 'string' | 'number' | 'email' | 'phone' | 'date' | 'enum' | 'boolean';

export interface ImportExportFieldConfig<T = any> {
  key: keyof T | string;
  label: string;
  aliases?: string[];
  required?: boolean;
  type?: FieldType;
  enumValues?: string[];
  example?: string | number;
  description?: string;
  validate?: (value: any, rawRow: Record<string, any>, existingRecords: T[]) => string | null;
  transform?: (value: any) => any;
}

export interface ImportExportSchemaConfig<T = any> {
  moduleName: string;
  entityNameSingular: string;
  entityNamePlural: string;
  fields: ImportExportFieldConfig<T>[];
  sampleRows: Record<string, any>[];
  uniqueKeys?: (keyof T | string)[];
  transformToEntity: (mappedRow: Record<string, any>, organizationId: string) => Partial<T>;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ImportRowValidationResult<T = any> {
  rowIndex: number;
  rawRow: Record<string, any>;
  mappedData: Record<string, any>;
  entityCandidate: Partial<T>;
  isValid: boolean;
  isDuplicate: boolean;
  errors: FieldError[];
  warnings: FieldError[];
}

export interface ImportPreviewSummary<T = any> {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  validatedRows: ImportRowValidationResult<T>[];
  columnMappings: Record<string, string>; // rawHeader -> schemaKey
}

export interface ImportExecutionResult<T = any> {
  success: boolean;
  totalProcessed: number;
  importedCount: number;
  failedCount: number;
  importedRecords: T[];
  errors: { rowIndex: number; field: string; message: string }[];
  timestamp: string;
  fileName: string;
}

export type ExportScope = 'all' | 'currentPage' | 'selected';
export type FileFormat = 'csv' | 'xlsx';

export interface ExportOptions<T = any> {
  format: FileFormat;
  scope: ExportScope;
  selectedIds?: string[];
  currentPageRecords?: T[];
  includeHeaders?: boolean;
  customFilename?: string;
  organizationName?: string;
}

export interface ImportExportHistoryRecord {
  id: string;
  timestamp: string;
  moduleName: string;
  operation: 'import' | 'export';
  format: FileFormat;
  totalRecords: number;
  successCount: number;
  errorCount: number;
  fileName: string;
  status: 'completed' | 'failed' | 'partial';
}
