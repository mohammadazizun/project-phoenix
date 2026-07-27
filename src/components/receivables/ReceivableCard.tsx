import React from 'react';
import { ReceivableRecord } from '../../services/receivablesEngine/types';
import { ReceivableMapper } from '../../services/receivablesEngine/ReceivableMapper';
import { ReceivableStatusBadge } from './ReceivableStatusBadge';
import { Calendar, FileText, ChevronRight, AlertTriangle } from 'lucide-react';

interface ReceivableCardProps {
  receivable: ReceivableRecord;
  onClickDetail: (record: ReceivableRecord) => void;
  currency?: string;
}

export const ReceivableCard: React.FC<ReceivableCardProps> = ({
  receivable,
  onClickDetail,
  currency = 'USD',
}) => {
  const isOverdue = ReceivableMapper.isOverdue(receivable);
  const paidPercentage =
    receivable.amount > 0
      ? Math.min(100, Math.round((receivable.paidAmount / receivable.amount) * 100))
      : 0;

  return (
    <div
      onClick={() => onClickDetail(receivable)}
      className={`bg-slate-800/40 hover:bg-slate-800/80 border ${
        isOverdue ? 'border-rose-500/40 hover:border-rose-500/60' : 'border-slate-800 hover:border-slate-700'
      } rounded-xl p-3.5 space-y-3 cursor-pointer transition-all shadow-sm hover:shadow-md text-xs group`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-slate-100 group-hover:text-indigo-300 transition-colors text-xs">
              {receivable.referenceNumber}
            </span>
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-900 text-slate-400 border border-slate-700">
              {receivable.referenceType}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Due: {receivable.dueDate.substring(0, 10)}</span>
            </span>
            {isOverdue && (
              <span className="text-rose-400 font-bold flex items-center gap-0.5">
                <AlertTriangle className="w-3 h-3" />
                OVERDUE
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ReceivableStatusBadge status={receivable.status} isOverdue={isOverdue} />
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>

      {/* Financial Amounts Row */}
      <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 font-mono">
        <div>
          <div className="text-[9px] text-slate-500 uppercase">Total Value</div>
          <div className="font-bold text-slate-200">
            {ReceivableMapper.formatCurrency(receivable.amount, currency)}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-slate-500 uppercase">Paid Settlement</div>
          <div className="font-bold text-emerald-400">
            {ReceivableMapper.formatCurrency(receivable.paidAmount, currency)}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-slate-500 uppercase">Remaining Due</div>
          <div
            className={`font-bold ${
              receivable.remainingAmount > 0 ? 'text-indigo-300' : 'text-slate-400'
            }`}
          >
            {ReceivableMapper.formatCurrency(receivable.remainingAmount, currency)}
          </div>
        </div>
      </div>

      {/* Settlement Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Settlement Progress</span>
          <span className="font-bold text-slate-200">{paidPercentage}% Paid</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${
              paidPercentage >= 100
                ? 'bg-emerald-500'
                : paidPercentage > 0
                ? 'bg-blue-500'
                : 'bg-slate-700'
            }`}
            style={{ width: `${paidPercentage}%` }}
          />
        </div>
      </div>

      {/* Notes preview */}
      {receivable.notes && (
        <div className="text-[10px] text-slate-400 italic line-clamp-1 border-t border-slate-800/60 pt-1.5">
          "{receivable.notes}"
        </div>
      )}
    </div>
  );
};
