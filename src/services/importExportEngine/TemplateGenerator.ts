import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { ImportExportSchemaConfig } from './types';

export class TemplateGenerator {
  /**
   * Generate downloadable Template file (CSV or XLSX) based on generic schema
   */
  public static downloadTemplate<T>(
    schema: ImportExportSchemaConfig<T>,
    format: 'csv' | 'xlsx' = 'xlsx'
  ) {
    const headers = schema.fields.map((f) => f.label);

    // Build sample data rows
    const sampleDataRows = schema.sampleRows.map((sample) => {
      const row: Record<string, any> = {};
      schema.fields.forEach((field) => {
        const val = sample[field.key as string] ?? sample[field.label] ?? field.example ?? '';
        row[field.label] = val;
      });
      return row;
    });

    const fileName = `${schema.moduleName.toLowerCase().replace(/\s+/g, '_')}_import_template.${format}`;

    if (format === 'csv') {
      const csvString = Papa.unparse({
        fields: headers,
        data: sampleDataRows.map((r) => headers.map((h) => r[h] ?? '')),
      });

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      this.triggerDownload(blob, fileName);
    } else {
      // XLSX Format
      const worksheetData = [
        headers,
        ...sampleDataRows.map((r) => headers.map((h) => r[h] ?? '')),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Auto-fit column widths
      const colWidths = headers.map((h) => ({
        wch: Math.max(h.length + 5, 18),
      }));
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `${schema.entityNamePlural} Template`);

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      this.triggerDownload(blob, fileName);
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
