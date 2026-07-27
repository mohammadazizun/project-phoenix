import {
  ImportExportSchemaConfig,
  ImportPreviewSummary,
  ImportRowValidationResult,
  ImportExecutionResult,
  FieldError,
} from './types';
import { ParsedFileData } from './FileParser';

export class ImportEngine {
  /**
   * Automatically infer mapping between uploaded file headers and schema fields
   */
  public static mapHeaders<T>(
    fileHeaders: string[],
    schema: ImportExportSchemaConfig<T>
  ): Record<string, string> {
    const mappings: Record<string, string> = {};

    fileHeaders.forEach((header) => {
      const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Direct key or label match
      const matchedField = schema.fields.find((field) => {
        const keyNorm = String(field.key).toLowerCase().replace(/[^a-z0-9]/g, '');
        const labelNorm = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (keyNorm === normalizedHeader || labelNorm === normalizedHeader) {
          return true;
        }

        // Check aliases if defined
        if (field.aliases) {
          return field.aliases.some(
            (alias) => alias.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedHeader
          );
        }

        return false;
      });

      if (matchedField) {
        mappings[header] = String(matchedField.key);
      } else {
        mappings[header] = ''; // Unmapped
      }
    });

    return mappings;
  }

  /**
   * Validate uploaded rows against schema & existing dataset
   */
  public static validateDataset<T>(
    parsedFile: ParsedFileData,
    columnMappings: Record<string, string>,
    schema: ImportExportSchemaConfig<T>,
    existingRecords: T[],
    organizationId: string
  ): ImportPreviewSummary<T> {
    const validatedRows: ImportRowValidationResult<T>[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;

    // Track unique keys within the batch to detect internal file duplicates
    const batchSeenKeys = new Set<string>();

    parsedFile.rows.forEach((rawRow, index) => {
      const rowIndex = index + 1; // 1-based index
      const mappedData: Record<string, any> = {};
      const errors: FieldError[] = [];
      const warnings: FieldError[] = [];

      // 1. Map raw headers to schema key names
      Object.entries(columnMappings).forEach(([fileHeader, schemaKey]) => {
        if (schemaKey && rawRow[fileHeader] !== undefined) {
          mappedData[schemaKey] = rawRow[fileHeader];
        }
      });

      // 2. Validate field rules
      schema.fields.forEach((fieldConfig) => {
        const fieldKey = String(fieldConfig.key);
        let rawVal = mappedData[fieldKey];

        // Required check
        if (fieldConfig.required && (rawVal === undefined || rawVal === null || String(rawVal).trim() === '')) {
          errors.push({
            field: fieldConfig.label,
            message: `${fieldConfig.label} is required.`,
          });
          return;
        }

        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
          const strVal = String(rawVal).trim();

          // Email validation
          if (fieldConfig.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(strVal)) {
              errors.push({
                field: fieldConfig.label,
                message: `Invalid email address format "${strVal}".`,
              });
            }
          }

          // Number validation
          if (fieldConfig.type === 'number') {
            const numVal = Number(strVal);
            if (isNaN(numVal)) {
              errors.push({
                field: fieldConfig.label,
                message: `${fieldConfig.label} must be a valid numeric value.`,
              });
            }
          }

          // Enum validation
          if (fieldConfig.type === 'enum' && fieldConfig.enumValues) {
            const normalizedVal = strVal.toLowerCase();
            const matched = fieldConfig.enumValues.find((ev) => ev.toLowerCase() === normalizedVal);
            if (!matched) {
              errors.push({
                field: fieldConfig.label,
                message: `Invalid value "${strVal}". Allowed values: ${fieldConfig.enumValues.join(', ')}.`,
              });
            } else {
              mappedData[fieldKey] = matched; // Standardize casing
            }
          }

          // Custom field validator
          if (fieldConfig.validate) {
            const customErr = fieldConfig.validate(rawVal, mappedData, existingRecords);
            if (customErr) {
              errors.push({
                field: fieldConfig.label,
                message: customErr,
              });
            }
          }

          // Transform if configured
          if (fieldConfig.transform) {
            mappedData[fieldKey] = fieldConfig.transform(rawVal);
          }
        }
      });

      // 3. Duplicate check against uniqueKeys
      let isDuplicate = false;
      if (schema.uniqueKeys && schema.uniqueKeys.length > 0) {
        const uniqueCompositeKey = schema.uniqueKeys
          .map((k) => String(mappedData[String(k)] || '').trim().toLowerCase())
          .filter(Boolean)
          .join('::');

        if (uniqueCompositeKey) {
          // Internal file duplicate check
          if (batchSeenKeys.has(uniqueCompositeKey)) {
            isDuplicate = true;
            warnings.push({
              field: 'Duplicate Row',
              message: `Duplicate record within the same file (Key: ${uniqueCompositeKey}).`,
            });
          } else {
            batchSeenKeys.add(uniqueCompositeKey);
          }

          // Existing database record duplicate check
          const existsInDB = existingRecords.some((record) => {
            const dbCompositeKey = schema.uniqueKeys!
              .map((k) => String((record as any)[String(k)] || '').trim().toLowerCase())
              .filter(Boolean)
              .join('::');

            return dbCompositeKey && dbCompositeKey === uniqueCompositeKey;
          });

          if (existsInDB) {
            isDuplicate = true;
            errors.push({
              field: 'Database Duplicate',
              message: `Record with unique key (${uniqueCompositeKey}) already exists in the system.`,
            });
          }
        }
      }

      const isValid = errors.length === 0;

      if (isValid) {
        validCount++;
      } else {
        invalidCount++;
      }

      if (isDuplicate) {
        duplicateCount++;
      }

      // Convert mapped row candidate into domain entity using schema transformer
      const entityCandidate = schema.transformToEntity(mappedData, organizationId);

      validatedRows.push({
        rowIndex,
        rawRow,
        mappedData,
        entityCandidate,
        isValid,
        isDuplicate,
        errors,
        warnings,
      });
    });

    return {
      totalRows: parsedFile.rows.length,
      validCount,
      invalidCount,
      duplicateCount,
      validatedRows,
      columnMappings,
    };
  }

  /**
   * Execute actual import of valid records
   */
  public static async executeImport<T>(
    validatedSummary: ImportPreviewSummary<T>,
    persistFn: (records: Partial<T>[]) => Promise<{ success: boolean; inserted: T[]; error?: string }>,
    fileName: string,
    skipInvalidRows: boolean = true
  ): Promise<ImportExecutionResult<T>> {
    const timestamp = new Date().toISOString();

    const targetRows = skipInvalidRows
      ? validatedSummary.validatedRows.filter((r) => r.isValid)
      : validatedSummary.validatedRows;

    if (targetRows.length === 0) {
      return {
        success: false,
        totalProcessed: validatedSummary.totalRows,
        importedCount: 0,
        failedCount: validatedSummary.invalidCount,
        importedRecords: [],
        errors: [{ rowIndex: 0, field: 'Import', message: 'No valid rows available to import.' }],
        timestamp,
        fileName,
      };
    }

    try {
      const candidates = targetRows.map((r) => r.entityCandidate);
      const result = await persistFn(candidates);

      if (!result.success) {
        return {
          success: false,
          totalProcessed: validatedSummary.totalRows,
          importedCount: 0,
          failedCount: validatedSummary.totalRows,
          importedRecords: [],
          errors: [{ rowIndex: 0, field: 'Database', message: result.error || 'Transaction rolled back.' }],
          timestamp,
          fileName,
        };
      }

      return {
        success: true,
        totalProcessed: validatedSummary.totalRows,
        importedCount: result.inserted.length,
        failedCount: validatedSummary.totalRows - result.inserted.length,
        importedRecords: result.inserted,
        errors: [],
        timestamp,
        fileName,
      };
    } catch (err: any) {
      return {
        success: false,
        totalProcessed: validatedSummary.totalRows,
        importedCount: 0,
        failedCount: validatedSummary.totalRows,
        importedRecords: [],
        errors: [{ rowIndex: 0, field: 'Exception', message: err.message || 'Import execution failed.' }],
        timestamp,
        fileName,
      };
    }
  }
}
