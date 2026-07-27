/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Statistics Placeholder Component
 */

import React from 'react';
import { Package, CheckCircle2, DollarSign, Tag, Layers } from 'lucide-react';
import { ProductSummary } from '../../services/productEngine/types';
import { ProductMapper } from '../../services/productEngine/ProductMapper';

interface ProductStatisticsPlaceholderProps {
  summary: ProductSummary | null;
}

export const ProductStatisticsPlaceholder: React.FC<ProductStatisticsPlaceholderProps> = ({ summary }) => {
  const currency = 'USD';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Master SKUs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Total Catalog SKUs</span>
          <Package className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="text-2xl font-black text-white">
          {summary ? summary.totalProducts : '—'}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span className="text-emerald-400 font-bold">{summary?.activeProducts ?? 0} Active</span>
          <span>•</span>
          <span className="text-amber-400 font-bold">{summary?.draftProducts ?? 0} Draft</span>
        </div>
      </div>

      {/* Active Catalog Items */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Active Catalog</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="text-2xl font-black text-emerald-400">
          {summary ? summary.activeProducts : '—'}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Ready for Sales & POS pipeline
        </div>
      </div>

      {/* Catalog Valuation Placeholder */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Estimated Valuation</span>
          <DollarSign className="w-4 h-4 text-amber-400" />
        </div>
        <div className="text-2xl font-black text-amber-400">
          {summary ? ProductMapper.formatCurrency(summary.totalCatalogValuation, currency) : '—'}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Minimum stock base valuation
        </div>
      </div>

      {/* Average Selling Price */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-2">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-bold uppercase tracking-wider">Avg Selling Price</span>
          <Tag className="w-4 h-4 text-sky-400" />
        </div>
        <div className="text-2xl font-black text-sky-400">
          {summary ? ProductMapper.formatCurrency(summary.averageSellingPrice, currency) : '—'}
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Master catalog price benchmark
        </div>
      </div>
    </div>
  );
};
