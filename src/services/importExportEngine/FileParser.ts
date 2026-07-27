import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFileData {
  fileName: string;
  fileSize: number;
  fileType: 'csv' | 'xlsx';
  headers: string[];
  rows: Record<string, any>[];
}

export class FileParser {
  /**
   * Parse uploaded File into structured rows & headers
   */
  public static async parseFile(file: File): Promise<ParsedFileData> {
    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      return this.parseCSV(file);
    } else if (extension === 'xlsx' || extension === 'xls') {
      return this.parseXLSX(file);
    } else {
      throw new Error(`Unsupported file type ".${extension}". Please upload a CSV or XLSX file.`);
    }
  }

  /**
   * Parse CSV file using PapaParse
   */
  private static parseCSV(file: File): Promise<ParsedFileData> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: false, // Keep as string for uniform validation
        complete: (results) => {
          if (results.errors && results.errors.length > 0 && results.data.length === 0) {
            return reject(new Error(`CSV Parsing Error: ${results.errors[0].message}`));
          }

          const rawRows = results.data as Record<string, any>[];
          const headers = results.meta.fields || (rawRows.length > 0 ? Object.keys(rawRows[0]) : []);

          resolve({
            fileName: file.name,
            fileSize: file.size,
            fileType: 'csv',
            headers: headers.map((h) => h.trim()),
            rows: rawRows.map((r) => {
              const cleaned: Record<string, any> = {};
              Object.keys(r).forEach((k) => {
                cleaned[k.trim()] = typeof r[k] === 'string' ? r[k].trim() : r[k];
              });
              return cleaned;
            }),
          });
        },
        error: (err) => {
          reject(new Error(`Failed to read CSV file: ${err.message}`));
        },
      });
    });
  }

  /**
   * Parse XLSX / XLS file using SheetJS
   */
  private static parseXLSX(file: File): Promise<ParsedFileData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            throw new Error('XLSX file contains no readable worksheets.');
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, {
            header: 1,
            defval: '',
          });

          if (rawJson.length === 0) {
            return resolve({
              fileName: file.name,
              fileSize: file.size,
              fileType: 'xlsx',
              headers: [],
              rows: [],
            });
          }

          const rawHeaders = (rawJson[0] as any[]).map((h) => String(h || '').trim());
          const headers = rawHeaders.filter((h) => h.length > 0);

          const rows: Record<string, any>[] = [];
          for (let i = 1; i < rawJson.length; i++) {
            const rowArray = rawJson[i] as any[];
            // Skip entirely empty rows
            if (!rowArray || rowArray.every((cell) => cell === '' || cell === null || cell === undefined)) {
              continue;
            }

            const rowObj: Record<string, any> = {};
            headers.forEach((header, index) => {
              const val = rowArray[index];
              rowObj[header] = val !== undefined && val !== null ? String(val).trim() : '';
            });
            rows.push(rowObj);
          }

          resolve({
            fileName: file.name,
            fileSize: file.size,
            fileType: 'xlsx',
            headers,
            rows,
          });
        } catch (err: any) {
          reject(new Error(`Failed to parse Excel workbook: ${err.message}`));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file from disk.'));
      reader.readAsArrayBuffer(file);
    });
  }
}
