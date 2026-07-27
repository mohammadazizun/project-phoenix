import React, { useState } from 'react';
import { LedgerAccount, LedgerEntry, BusinessEvent, TenantContext } from '../types';
import { Landmark, Plus, CheckCircle2, DollarSign, FileText, Scale } from 'lucide-react';

interface FinanceCapabilityProps {
  tenant: TenantContext;
  accounts: LedgerAccount[];
  entries: LedgerEntry[];
  onAddEntry: (entry: LedgerEntry) => void;
  onEmitEvent: (event: BusinessEvent) => void;
}

export const FinanceCapability: React.FC<FinanceCapabilityProps> = ({
  tenant,
  accounts,
  entries,
  onAddEntry,
  onEmitEvent,
}) => {
  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [description, setDescription] = useState('');
  const [debitAccount, setDebitAccount] = useState('1010');
  const [creditAccount, setCreditAccount] = useState('4010');
  const [amount, setAmount] = useState<number>(5000);

  const handlePostEntry = () => {
    if (!description || amount <= 0) return;

    const entryId = `gl_${Date.now()}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const debitAccObj = accounts.find((a) => a.accountCode === debitAccount);
    const creditAccObj = accounts.find((a) => a.accountCode === creditAccount);

    const newEntry: LedgerEntry = {
      id: entryId,
      date: formattedDate,
      description,
      debitAccount: `${debitAccObj?.accountCode} ${debitAccObj?.accountName}`,
      creditAccount: `${creditAccObj?.accountCode} ${creditAccObj?.accountName}`,
      amount,
      referenceEventId: `evt_gl_${Date.now()}`,
      status: 'Posted',
    };

    onAddEntry(newEntry);

    // Emit event
    const event: BusinessEvent = {
      id: `evt_fin_${Date.now()}`,
      eventType: 'finance.entry_posted',
      timestamp: now.toISOString(),
      sourceCapability: 'cap_finance',
      tenantId: tenant.organizationId,
      entityLocation: tenant.locationName,
      payload: {
        entryId,
        description,
        debitAccount: debitAccObj?.accountName,
        creditAccount: creditAccObj?.accountName,
        amount,
      },
      correlationId: `corr_gl_${Date.now()}`,
      status: 'processed',
    };
    onEmitEvent(event);

    setShowNewEntryModal(false);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Capability Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800 text-white shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-indigo-600 text-white">
              <Landmark className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-white">Finance & Double-Entry Ledger Capability</h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
              cap_finance v1.8.0
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Immutable double-entry ledger & chart of accounts. Emits <code className="text-indigo-400 font-bold">finance.entry_posted</code> events upon journal verification.
          </p>
        </div>

        <button
          onClick={() => setShowNewEntryModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-md shadow-sm transition-all cursor-pointer uppercase tracking-tight shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Journal Entry</span>
        </button>
      </div>

      {/* Chart of Accounts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {accounts.map((acc) => (
          <div key={acc.id} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 text-xs">
              <span className="font-mono font-bold text-indigo-700">{acc.accountCode}</span>
              <span className="px-2 py-0.5 text-[9px] uppercase font-bold bg-slate-100 text-slate-600 rounded">
                {acc.type}
              </span>
            </div>
            <div className="font-bold text-sm text-slate-900">{acc.accountName}</div>
            <div className="text-lg font-bold font-mono text-emerald-600">
              ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Journal Entries Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">
            General Ledger Journal Entries ({entries.length})
          </h3>
          <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <Scale className="w-4 h-4" />
            <span>Debits == Credits Balanced</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-widest text-[10px]">
              <tr>
                <th className="px-6 py-3">Entry ID</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Description</th>
                <th className="px-6 py-3">Debit Account</th>
                <th className="px-6 py-3">Credit Account</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-700 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    {entry.id}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{entry.date}</td>
                  <td className="px-6 py-4 font-semibold text-slate-900">{entry.description}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{entry.debitAccount}</td>
                  <td className="px-6 py-4 font-mono text-slate-600">{entry.creditAccount}</td>
                  <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                    ${entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Journal Entry Modal */}
      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Post General Ledger Journal Entry</span>
              </h3>
              <button onClick={() => setShowNewEntryModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Transaction Description</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Software License Subscriptions Revenue"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Debit Account (+ Asset / + Expense)</label>
                  <select
                    value={debitAccount}
                    onChange={(e) => setDebitAccount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.accountCode}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Credit Account (+ Rev / + Liab)</label>
                  <select
                    value={creditAccount}
                    onChange={(e) => setCreditAccount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none cursor-pointer"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.accountCode}>
                        {a.accountCode} - {a.accountName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Entry Amount ($ USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs font-bold">
              <button
                onClick={() => setShowNewEntryModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handlePostEntry}
                disabled={!description || amount <= 0}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 disabled:opacity-50 text-slate-950 rounded-lg hover:from-emerald-400 cursor-pointer"
              >
                Post Entry & Emit Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
