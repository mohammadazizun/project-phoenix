import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ImportExportSchemaConfig, ExportOptions } from './types';

export class ExportEngine {
  /**
   * Export dataset to CSV or XLSX
   */
  public static exportData<T>(
    records: T[],
    schema: ImportExportSchemaConfig<T>,
    options: ExportOptions<T>
  ) {
    // 1. Filter dataset by scope
    let exportRecords = [...records];

    if (options.scope === 'selected' && options.selectedIds && options.selectedIds.length > 0) {
      const selectedSet = new Set(options.selectedIds);
      exportRecords = exportRecords.filter((r) => selectedSet.has((r as any).id));
    } else if (options.scope === 'currentPage' && options.currentPageRecords) {
      exportRecords = options.currentPageRecords;
    }

    const headers = schema.fields.map((f) => f.label);

    // 2. Format row values based on schema field types & keys
    const formattedRows = exportRecords.map((record) => {
      const row: Record<string, any> = {};

      schema.fields.forEach((field) => {
        const fieldKey = String(field.key);
        let val = (record as any)[fieldKey];

        // Format dates
        if (field.type === 'date' && val) {
          try {
            val = new Date(val).toISOString().replace('T', ' ').substring(0, 16);
          } catch {
            // Keep original string
          }
        }

        // Format numbers
        if (field.type === 'number' && typeof val === 'number') {
          val = val;
        }

        row[field.label] = val !== undefined && val !== null ? val : '';
      });

      return row;
    });

    // 3. Construct File Name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const defaultPrefix = schema.moduleName.toLowerCase().replace(/\s+/g, '_');
    const filename = options.customFilename
      ? `${options.customFilename}.${options.format}`
      : `${defaultPrefix}_export_${timestamp}.${options.format}`;

    // 4. Output File
    if (options.format === 'csv') {
      const csvContent = Papa.unparse({
        fields: headers,
        data: formattedRows.map((r) => headers.map((h) => r[h] ?? '')),
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      this.triggerDownload(blob, filename);
    } else {
      // XLSX Format
      const worksheetData = [
        headers,
        ...formattedRows.map((r) => headers.map((h) => r[h] ?? '')),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Auto-adjust column widths
      const colWidths = headers.map((h) => {
        const maxLen = Math.max(h.length, ...formattedRows.map((r) => String(r[h] || '').length));
        return { wch: Math.min(Math.max(maxLen + 3, 14), 40) };
      });
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${schema.entityNamePlural}`);

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      this.triggerDownload(blob, filename);
    }
  }

  private static triggerDownload(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
