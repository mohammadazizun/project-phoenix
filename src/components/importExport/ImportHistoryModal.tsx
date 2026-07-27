import React from 'react';
import { HistoryService } from '../../services/importExportEngine/HistoryService';
import { History, X, FileSpreadsheet, FileText, Upload, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface ImportHistoryModalProps {
  isOpen: boolean;
  moduleName?: string;
  onClose: () => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
  isOpen,
  moduleName = 'Customer',
  onClose,
}) => {
  if (!isOpen) return null;

  const logs = HistoryService.getHistory(moduleName);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <History className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-white">
              {moduleName} Import & Export Audit History
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs Table */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {logs.length === 0 ? (
            <div className="text-center py-10 space-y-2 bg-slate-800/30 rounded-xl border border-slate-800">
              <History className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-slate-400 font-medium">No import or export operations recorded yet.</p>
              <p className="text-[11px] text-slate-500">
                Perform an import or export action to populate the activity log.
              </p>
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-slate-300"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`p-2 rounded-lg border ${
                      log.operation === 'import'
                        ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                        : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {log.operation === 'import' ? (
                      <Upload className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span className="capitalize">{log.operation}</span> &bull;{' '}
                      <span className="font-mono text-slate-300">{log.fileName}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {log.timestamp.replace('T', ' ').substring(0, 19)} &bull; Format: {log.format.toUpperCase()}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-slate-200">
                    {log.successCount} / {log.totalRecords} records
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                      log.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {log.status === 'completed' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    <span className="capitalize">{log.status}</span>
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800 shrink-0 font-bold">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close Log
          </button>
        </div>
      </div>
    </div>
  );
};
