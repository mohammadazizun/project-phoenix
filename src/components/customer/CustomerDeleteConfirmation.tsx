import React, { useState } from 'react';
import { CRMContact } from '../../types';
import { AlertTriangle, X } from 'lucide-react';

interface CustomerDeleteConfirmationProps {
  isOpen: boolean;
  customer: CRMContact | null;
  onClose: () => void;
  onConfirmDelete: (customerId: string) => Promise<{ success: boolean; error?: string }>;
}

export const CustomerDeleteConfirmation: React.FC<CustomerDeleteConfirmationProps> = ({
  isOpen,
  customer,
  onClose,
  onConfirmDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !customer) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    const result = await onConfirmDelete(customer.id);
    setDeleting(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.error || 'Failed to soft delete customer record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-rose-400">
            <span className="p-1.5 rounded-lg bg-rose-500/20 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-white">Confirm Customer Removal</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="text-xs space-y-2 text-slate-300 leading-relaxed">
          <p>
            Are you sure you want to perform a <strong className="text-white">Soft Delete</strong> on customer{' '}
            <strong className="text-indigo-400">{customer.name}</strong> ({customer.customerCode || customer.company})?
          </p>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Customer Code:</span>
              <span className="font-mono text-slate-200">{customer.customerCode || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span>Company:</span>
              <span className="text-slate-200">{customer.company}</span>
            </div>
            <div className="flex justify-between">
              <span>Current Stage:</span>
              <span className="text-indigo-300 font-bold">{customer.stage}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            Note: This action marks the record as inactive/deleted without destroying audit trail or historical sales correlations.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors shadow-md cursor-pointer disabled:opacity-50"
          >
            {deleting ? 'Removing...' : 'Confirm Soft Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
