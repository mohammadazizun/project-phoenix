import React, { useState } from 'react';
import {
  ImportExportSchemaConfig,
  ExportScope,
  FileFormat,
} from '../../services/importExportEngine/types';
import { ExportEngine } from '../../services/importExportEngine/ExportEngine';
import { HistoryService } from '../../services/importExportEngine/HistoryService';
import { ActivityEngine } from '../../services/timelineEngine/ActivityEngine';
import {
  Download,
  X,
  FileSpreadsheet,
  FileText,
  Filter,
  CheckCircle2,
  Building2,
} from 'lucide-react';

interface ExportOptionsModalProps<T = any> {
  isOpen: boolean;
  schema: ImportExportSchemaConfig<T>;
  records: T[];
  currentPageRecords?: T[];
  selectedIds?: string[];
  organizationName?: string;
  onClose: () => void;
  onSuccessNotification?: (message: string) => void;
}

export function ExportOptionsModal<T = any>({
  isOpen,
  schema,
  records,
  currentPageRecords,
  selectedIds = [],
  organizationName,
  onClose,
  onSuccessNotification,
}: ExportOptionsModalProps<T>) {
  const [format, setFormat] = useState<FileFormat>('xlsx');
  const [scope, setScope] = useState<ExportScope>('all');
  const [customFilename, setCustomFilename] = useState(
    `${schema.moduleName.toLowerCase()}_export`
  );
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setExporting(true);

    try {
      ExportEngine.exportData(records, schema, {
        format,
        scope,
        selectedIds,
        currentPageRecords: currentPageRecords || records,
        customFilename,
        organizationName,
      });

      const count =
        scope === 'selected'
          ? selectedIds.length
          : scope === 'currentPage'
          ? (currentPageRecords || records).length
          : records.length;

      // Track history
      HistoryService.recordOperation({
        moduleName: schema.moduleName,
        operation: 'export',
        format,
        totalRecords: count,
        successCount: count,
        errorCount: 0,
        fileName: `${customFilename}.${format}`,
        status: 'completed',
      });

      // Log in Activity Timeline Engine
      ActivityEngine.logCustomerExported(
        {
          organizationId: 'org_main_001',
          organizationName: organizationName || 'Project Phoenix Org',
          legalEntity: 'PT Enterprise Indonesia',
          locationId: 'loc_hq',
          locationName: 'Jakarta HQ',
          currency: 'IDR',
          taxNumber: 'TAX-9981-00',
        },
        format,
        count
      );

      if (onSuccessNotification) {
        onSuccessNotification(
          `Exported ${schema.entityNamePlural} data to ${format.toUpperCase()} successfully.`
        );
      }

      onClose();
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExporting(false);
    }
  };

  const getRecordCountByScope = () => {
    if (scope === 'selected') return selectedIds.length;
    if (scope === 'currentPage' && currentPageRecords) return currentPageRecords.length;
    return records.length;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Download className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              Export {schema.entityNamePlural} Records
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="space-y-3">
          {/* Format Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">File Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('xlsx')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  format === 'xlsx'
                    ? 'bg-emerald-500/20 border-emerald-500 text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <div className="text-left">
                  <div>Excel (XLSX)</div>
                  <div className="text-[10px] text-slate-400 font-normal">Formated Workbook</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                  format === 'csv'
                    ? 'bg-indigo-500/20 border-indigo-500 text-white font-bold'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-400" />
                <div className="text-left">
                  <div>CSV Text</div>
                  <div className="text-[10px] text-slate-400 font-normal">Comma Separated</div>
                </div>
              </button>
            </div>
          </div>

          {/* Scope Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5">Export Scope</label>
            <div className="space-y-1.5">
              <label
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  scope === 'all'
                    ? 'bg-slate-800 border-indigo-500 text-white font-bold'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="scope"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="accent-indigo-500 cursor-pointer"
                  />
                  <span>All Active Records</span>
                </div>
                <span className="font-mono text-slate-300 font-bold">{records.length} items</span>
              </label>

              {currentPageRecords && currentPageRecords.length > 0 && (
                <label
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    scope === 'currentPage'
                      ? 'bg-slate-800 border-indigo-500 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === 'currentPage'}
                      onChange={() => setScope('currentPage')}
                      className="accent-indigo-500 cursor-pointer"
                    />
                    <span>Current Page Records</span>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">
                    {currentPageRecords.length} items
                  </span>
                </label>
              )}

              {selectedIds.length > 0 && (
                <label
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                    scope === 'selected'
                      ? 'bg-slate-800 border-indigo-500 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === 'selected'}
                      onChange={() => setScope('selected')}
                      className="accent-indigo-500 cursor-pointer"
                    />
                    <span>Selected Table Rows</span>
                  </div>
                  <span className="font-mono text-slate-300 font-bold">
                    {selectedIds.length} items
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Custom Filename */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">File Name Prefix</label>
            <input
              type="text"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="e.g. customer_records_q3"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 font-bold">
          <div className="text-[11px] text-slate-400 font-mono">
            Output: <strong className="text-white">{getRecordCountByScope()}</strong> records
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || getRecordCountByScope() === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-md transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Generating...' : 'Download File'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
