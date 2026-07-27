/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-012
 * Product Soft Delete Confirmation Modal
 */

import React, { useState } from 'react';
import { AlertTriangle, Trash2, Shield, Loader2 } from 'lucide-react';
import { ProductRecord } from '../../services/productEngine/types';

interface ProductDeleteConfirmModalProps {
  product: ProductRecord | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const ProductDeleteConfirmModal: React.FC<ProductDeleteConfirmModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await onConfirm(product.id);
      if (res.success) {
        onClose();
      } else {
        setError(res.error || 'Failed to archive product record.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error occurred.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Confirm Soft Delete</h2>
            <p className="text-xs text-slate-400">Enterprise Product Archive Contract</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Product Name:</span>
            <span className="font-bold text-white">{product.productName}</span>
          </div>
          <div className="flex justify-between items-center font-mono">
            <span className="text-slate-400">SKU Code:</span>
            <span className="text-indigo-400 font-bold">{product.sku}</span>
          </div>
        </div>

        <p className="text-slate-400 leading-relaxed text-[11px]">
          Soft-deleting sets the <span className="text-rose-400 font-mono">deleted_at</span> timestamp in accordance with RLS compliance. The record will be hidden from catalog queries while preserving audit trail integrity for future sales references.
        </p>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>RLS Soft Delete</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={deleting}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Soft Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
