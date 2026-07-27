/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Empty State Component
 */

import React from 'react';
import { PackageX, ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { TenantContext } from '../../types';

interface ProductEmptyStateProps {
  tenant: TenantContext;
}

export const ProductEmptyState: React.FC<ProductEmptyStateProps> = ({ tenant }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-xl space-y-4 max-w-2xl mx-auto my-8">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
        <PackageX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-white">No Products Registered for {tenant.organizationName}</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          The Product Foundation catalog is active and isolated under Row-Level Security (RLS) for tenant <span className="text-slate-200 font-mono">{tenant.organizationId}</span>, but contains no master product entries yet.
        </p>
      </div>

      <div className="pt-2 flex items-center justify-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RLS Active</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Execution-012 Ready</span>
        </div>
      </div>
    </div>
  );
};
