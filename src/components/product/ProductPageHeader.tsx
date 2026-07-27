/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Page Header & Breadcrumb
 */

import React from 'react';
import { Package, Building2, Shield, Layers } from 'lucide-react';
import { TenantContext } from '../../types';

interface ProductPageHeaderProps {
  tenant: TenantContext;
}

export const ProductPageHeader: React.FC<ProductPageHeaderProps> = ({ tenant }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white shadow-xl space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
        <span className="hover:text-slate-200 cursor-pointer">Enterprise Operations</span>
        <span>/</span>
        <span className="hover:text-slate-200 cursor-pointer">{tenant.organizationName}</span>
        <span>/</span>
        <span className="text-indigo-400 font-bold">Product Foundation (v3.2)</span>
      </div>

      {/* Title & Organization Context Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white">Product Master Catalog</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Foundation v3.2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Core master catalog definition, unit rules, SKU codes, and RLS tenant isolation schema.
              </p>
            </div>
          </div>
        </div>

        {/* Tenant Scope Metadata Badge */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 shrink-0">
          <Building2 className="w-4 h-4 text-indigo-400" />
          <div className="text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Active Tenant Scope</div>
            <div className="font-bold text-slate-200">{tenant.organizationName}</div>
          </div>
          <div className="pl-2 border-l border-slate-800 flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <Shield className="w-3 h-3" />
            <span>RLS Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
