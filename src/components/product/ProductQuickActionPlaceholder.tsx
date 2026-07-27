/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-012
 * Product Quick Action Control Header
 */

import React from 'react';
import { Plus, Download, Upload, Barcode, Lock, Sparkles } from 'lucide-react';

interface ProductQuickActionPlaceholderProps {
  onAddProduct?: () => void;
}

export const ProductQuickActionPlaceholder: React.FC<ProductQuickActionPlaceholderProps> = ({ onAddProduct }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-white">Product Action Controls</span>
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            CRUD Active
          </span>
        </div>
        <p className="text-xs text-slate-400">
          Create, edit, soft-delete, and view product master catalog entries with Zod validation & RLS context.
        </p>
      </div>

      <div className="flex items-center flex-wrap gap-2 shrink-0">
        <button
          onClick={onAddProduct}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>

        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-500 border border-slate-700/50 rounded-lg text-xs font-bold cursor-not-allowed opacity-80"
          title="Import Engine integration will be attached in future execution"
        >
          <Lock className="w-3.5 h-3.5" />
          <Upload className="w-3.5 h-3.5" />
          <span>Import CSV</span>
        </button>

        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-500 border border-slate-700/50 rounded-lg text-xs font-bold cursor-not-allowed opacity-80"
          title="Export Engine integration will be attached in future execution"
        >
          <Lock className="w-3.5 h-3.5" />
          <Download className="w-3.5 h-3.5" />
          <span>Export Catalog</span>
        </button>

        <button
          disabled
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-500 border border-slate-700/50 rounded-lg text-xs font-bold cursor-not-allowed opacity-80"
          title="Barcode Scanner integration locked until future execution"
        >
          <Lock className="w-3.5 h-3.5" />
          <Barcode className="w-3.5 h-3.5" />
          <span>Generate Barcode</span>
        </button>
      </div>
    </div>
  );
};
