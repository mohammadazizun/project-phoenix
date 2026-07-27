import React from 'react';
import { ReceivableRecord, RECEIVABLE_PERMISSIONS } from '../../services/receivablesEngine/types';
import { ReceivableMapper } from '../../services/receivablesEngine/ReceivableMapper';
import { ReceivableStatusBadge } from './ReceivableStatusBadge';
import {
  X,
  Receipt,
  Calendar,
  Building2,
  DollarSign,
  ShieldCheck,
  Info,
  Clock,
  Layers,
} from 'lucide-react';

interface ReceivableDetailModalProps {
  isOpen: boolean;
  receivable: ReceivableRecord | null;
  onClose: () => void;
  currency?: string;
}

export const ReceivableDetailModal: React.FC<ReceivableDetailModalProps> = ({
  isOpen,
  receivable,
  onClose,
  currency = 'USD',
}) => {
  if (!isOpen || !receivable) return null;

  const isOverdue = ReceivableMapper.isOverdue(receivable);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Receipt className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono">{receivable.referenceNumber}</h3>
                <ReceivableStatusBadge status={receivable.status} isOverdue={isOverdue} />
              </div>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                Ref Type: {receivable.referenceType} &bull; Ledger ID: {receivable.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Breakdown Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center font-mono">
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-500 uppercase">Gross Amount</div>
            <div className="text-sm font-bold text-slate-200">
              {ReceivableMapper.formatCurrency(receivable.amount, currency)}
            </div>
          </div>

          <div className="space-y-0.5 border-x border-slate-800">
            <div className="text-[10px] text-slate-500 uppercase">Settled Paid</div>
            <div className="text-sm font-bold text-emerald-400">
              {ReceivableMapper.formatCurrency(receivable.paidAmount, currency)}
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-500 uppercase">Remaining Due</div>
            <div className="text-sm font-bold text-indigo-300">
              {ReceivableMapper.formatCurrency(receivable.remainingAmount, currency)}
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="space-y-2.5">
          <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Due Date:</span>
              </span>
              <span className="font-mono font-bold text-slate-100">
                {receivable.dueDate.substring(0, 10)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Customer ID:</span>
              </span>
              <span className="font-mono text-slate-200">{receivable.customerId}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Organization Isolation:</span>
              </span>
              <span className="font-mono text-slate-200">{receivable.organizationId}</span>
            </div>
          </div>

          {/* Notes */}
          {receivable.notes && (
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Ledger Notes
              </div>
              <p className="text-slate-300 leading-relaxed italic">{receivable.notes}</p>
            </div>
          )}

          {/* Foundation Architecture Disclaimer */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 p-3 rounded-xl space-y-1 text-[10px] text-indigo-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-bold">Foundation Module Ready</strong>
              This receivable record belongs to the Receivables Foundation Engine. Future Sales and Payment modules will automatically append settlements and update statuses without architecture restructuring.
            </div>
          </div>

          {/* Security & Audit Metadata */}
          <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800 space-y-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Security & Audit Permissions</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Required Permission:</span>
              <span className="text-emerald-400 font-bold">{RECEIVABLE_PERMISSIONS.READ}</span>
            </div>
            <div className="flex justify-between text-slate-400 font-mono">
              <span>Created Timestamp:</span>
              <span>{receivable.createdAt.replace('T', ' ').substring(0, 19)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
