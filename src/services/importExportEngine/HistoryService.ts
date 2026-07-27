import { ImportExportHistoryRecord } from './types';

export class HistoryService {
  private static historyLogs: ImportExportHistoryRecord[] = [];

  public static getHistory(moduleName?: string): ImportExportHistoryRecord[] {
    if (!moduleName) return [...this.historyLogs];
    return this.historyLogs.filter((h) => h.moduleName.toLowerCase() === moduleName.toLowerCase());
  }

  public static recordOperation(
    log: Omit<ImportExportHistoryRecord, 'id' | 'timestamp'>
  ): ImportExportHistoryRecord {
    const record: ImportExportHistoryRecord = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    this.historyLogs.unshift(record);
    return record;
  }
}
