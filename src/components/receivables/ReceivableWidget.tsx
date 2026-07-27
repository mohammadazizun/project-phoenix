import React, { useState, useEffect } from 'react';
import { TenantContext } from '../../types';
import {
  ReceivableRecord,
  ReceivableSummary,
  ReceivableStatus,
  ReferenceType,
} from '../../services/receivablesEngine/types';
import { ReceivableService } from '../../services/receivablesEngine/ReceivableService';
import { ReceivableSummaryCard } from './ReceivableSummaryCard';
import { ReceivableCard } from './ReceivableCard';
import { ReceivableDetailModal } from './ReceivableDetailModal';
import {
  Receipt,
  Search,
  Plus,
  RefreshCw,
  AlertCircle,
  Clock,
  CheckCircle2,
  X,
  Info,
  ShieldCheck,
} from 'lucide-react';

interface ReceivableWidgetProps {
  tenant: TenantContext;
  customerId?: string;
  className?: string;
}

export const ReceivableWidget: React.FC<ReceivableWidgetProps> = ({
  tenant,
  customerId,
  className = '',
}) => {
  const [records, setRecords] = useState<ReceivableRecord[]>([]);
  const [summary, setSummary] = useState<ReceivableSummary>({
    totalOutstanding: 0,
    totalOverdue: 0,
    totalOpenCount: 0,
    totalPaidAmount: 0,
    byStatusCount: {
      draft: 0,
      open: 0,
      partially_paid: 0,
      paid: 0,
      cancelled: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<ReceivableStatus | 'all'>('all');
  const [isOverdueOnly, setIsOverdueOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedRecord, setSelectedRecord] = useState<ReceivableRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Record Form State
  const [formCustomer, setFormCustomer] = useState(customerId || 'cust_001');
  const [formRefNumber, setFormRefNumber] = useState('');
  const [formRefType, setFormRefType] = useState<ReferenceType>('MANUAL_ENTRY');
  const [formAmount, setFormAmount] = useState<number>(1000);
  const [formDueDate, setFormDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().substring(0, 10)
  );
  const [formNotes, setFormNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const data = await ReceivableService.getReceivables(tenant, {
        customerId,
        status: statusFilter,
        isOverdueOnly,
        searchQuery,
      });

      const summaryData = await ReceivableService.getSummary(tenant, customerId);

      setRecords(data);
      setSummary(summaryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load receivables dataset.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenant.organizationId, customerId, statusFilter, isOverdueOnly, searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormErrors({});

    const res = await ReceivableService.createReceivable(tenant, {
      customerId: customerId || formCustomer,
      referenceNumber: formRefNumber || `REF-${Date.now().toString().substring(6)}`,
      referenceType: formRefType,
      amount: Number(formAmount),
      dueDate: formDueDate,
      notes: formNotes,
    });

    setFormSubmitting(false);

    if (res.success) {
      setIsAddModalOpen(false);
      setFormRefNumber('');
      setFormNotes('');
      loadData(true);
    } else if (res.errors) {
      setFormErrors(res.errors);
    } else {
      setError(res.message || 'Failed to create receivable.');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Widget Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
        <div className="flex items-center gap-2.5 font-bold text-white">
          <span className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Receipt className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-bold">Receivables Foundation</h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Ledger tracking for customer balances & outstanding positions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Init Ledger Item</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics Card */}
      <ReceivableSummaryCard summary={summary} currency={tenant.currency || 'USD'} />

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by reference number or notes..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-slate-900 border border-slate-800 text-slate-200 rounded-lg px-3 py-1.5 cursor-pointer focus:outline-none focus:border-indigo-500 text-xs"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <button
          onClick={() => setIsOverdueOnly(!isOverdueOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
            isOverdueOnly
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Overdue Only</span>
        </button>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main List Body */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-10 px-4 space-y-3 bg-slate-900/40 rounded-2xl border border-slate-800/80">
          <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-300">No Receivables Records Found</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {statusFilter !== 'all' || isOverdueOnly || searchQuery !== ''
                ? 'No receivables match your active filter criteria.'
                : 'Initialize an opening balance item to test the receivables ledger.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {records.map((record) => (
            <ReceivableCard
              key={record.id}
              receivable={record}
              onClickDetail={(r) => setSelectedRecord(r)}
              currency={tenant.currency || 'USD'}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <ReceivableDetailModal
        isOpen={Boolean(selectedRecord)}
        receivable={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        currency={tenant.currency || 'USD'}
      />

      {/* Add / Init Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-white text-sm">Initialize Receivable Ledger Item</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              {!customerId && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Customer ID</label>
                  <input
                    type="text"
                    value={formCustomer}
                    onChange={(e) => setFormCustomer(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  />
                  {formErrors.customerId && (
                    <p className="text-rose-400 text-[10px]">{formErrors.customerId}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">
                    Reference Number
                  </label>
                  <input
                    type="text"
                    value={formRefNumber}
                    onChange={(e) => setFormRefNumber(e.target.value)}
                    placeholder="e.g. INV-2026-900"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                  {formErrors.referenceNumber && (
                    <p className="text-rose-400 text-[10px]">{formErrors.referenceNumber}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Reference Type</label>
                  <select
                    value={formRefType}
                    onChange={(e) => setFormRefType(e.target.value as ReferenceType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="MANUAL_ENTRY">MANUAL_ENTRY</option>
                    <option value="OPENING_BALANCE">OPENING_BALANCE</option>
                    <option value="INVOICE">INVOICE</option>
                    <option value="ORDER_ADVANCE">ORDER_ADVANCE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">
                    Amount ({tenant.currency || 'USD'})
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value))}
                    min="1"
                    step="10"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                  {formErrors.amount && (
                    <p className="text-rose-400 text-[10px]">{formErrors.amount}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                  {formErrors.dueDate && (
                    <p className="text-rose-400 text-[10px]">{formErrors.dueDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Notes</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Optional ledger notes or details..."
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold shadow cursor-pointer"
                >
                  {formSubmitting ? 'Recording...' : 'Record Receivable'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
