import React from 'react';
import { ReceivableSummary } from '../../services/receivablesEngine/types';
import { ReceivableMapper } from '../../services/receivablesEngine/ReceivableMapper';
import { DollarSign, AlertCircle, CheckCircle2, Clock, Landmark } from 'lucide-react';

interface ReceivableSummaryCardProps {
  summary: ReceivableSummary;
  currency?: string;
}

export const ReceivableSummaryCard: React.FC<ReceivableSummaryCardProps> = ({
  summary,
  currency = 'USD',
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-xs">
      {/* Total Outstanding */}
      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>Total Outstanding</span>
        </div>
        <div className="text-base font-bold text-indigo-300 font-mono">
          {ReceivableMapper.formatCurrency(summary.totalOutstanding, currency)}
        </div>
        <div className="text-[10px] text-slate-500">
          Across {summary.totalOpenCount} open ledger item(s)
        </div>
      </div>

      {/* Total Overdue */}
      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Overdue Balance</span>
        </div>
        <div
          className={`text-base font-bold font-mono ${
            summary.totalOverdue > 0 ? 'text-rose-400' : 'text-slate-400'
          }`}
        >
          {ReceivableMapper.formatCurrency(summary.totalOverdue, currency)}
        </div>
        <div className="text-[10px] text-slate-500">
          {summary.totalOverdue > 0 ? 'Requires immediate collection' : 'Zero overdue items'}
        </div>
      </div>

      {/* Settled / Paid Amount */}
      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Settled Revenue</span>
        </div>
        <div className="text-base font-bold text-emerald-400 font-mono">
          {ReceivableMapper.formatCurrency(summary.totalPaidAmount, currency)}
        </div>
        <div className="text-[10px] text-slate-500">
          {summary.byStatusCount.paid || 0} fully paid item(s)
        </div>
      </div>

      {/* Total Items Status breakdown */}
      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1 flex flex-col justify-between">
        <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
          <Landmark className="w-3.5 h-3.5 text-amber-400" />
          <span>Status Breakdown</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Open: {summary.byStatusCount.open || 0}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Partial: {summary.byStatusCount.partially_paid || 0}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Paid: {summary.byStatusCount.paid || 0}
          </span>
        </div>
        <div className="text-[10px] text-slate-500">Receivables Foundation v2.4</div>
      </div>
    </div>
  );
};
