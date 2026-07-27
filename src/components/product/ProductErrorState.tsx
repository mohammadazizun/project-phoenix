/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Error State Component
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ProductErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ProductErrorState: React.FC<ProductErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center shadow-xl space-y-4 max-w-xl mx-auto my-8">
      <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-bold text-white">Product Catalog Error</h3>
        <p className="text-xs text-rose-300 font-mono">{message}</p>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-700"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry Loading</span>
      </button>
    </div>
  );
};
