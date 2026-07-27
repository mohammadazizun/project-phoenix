/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Catalog Summary Card Header Component
 */

import React from 'react';
import { Package, FolderTree, Bookmark, Ruler, Tag, ShieldCheck, DollarSign } from 'lucide-react';
import { ProductSummary } from '../../services/productEngine/types';
import { ProductMapper } from '../../services/productEngine/ProductMapper';

interface CatalogSummaryCardProps {
  summary: ProductSummary | null;
  organizationId: string;
}

export const CatalogSummaryCard: React.FC<CatalogSummaryCardProps> = ({ summary, organizationId }) => {
  if (!summary) return null;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 backdrop-blur-md mb-6 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-100">Product Catalog Foundation</h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <ShieldCheck className="w-3 h-3" />
                RLS Scope: {organizationId}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Enterprise master catalog structure, categories, brand relationships, unit standards, and asset metadata.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-4 py-2">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Catalog Valuation</span>
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {ProductMapper.formatCurrency(summary.totalCatalogValuation)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {/* Total Products */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Package className="w-3.5 h-3.5 text-indigo-400" />
            <span>Products</span>
          </div>
          <div className="text-lg font-semibold text-slate-100 font-mono">
            {summary.totalProducts}
          </div>
          <span className="text-[10px] text-emerald-400">{summary.activeProducts} Active</span>
        </div>

        {/* Categories */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <FolderTree className="w-3.5 h-3.5 text-blue-400" />
            <span>Categories</span>
          </div>
          <div className="text-lg font-semibold text-slate-100 font-mono">
            {summary.totalCategories ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Taxonomy Nodes</span>
        </div>

        {/* Brands */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Bookmark className="w-3.5 h-3.5 text-purple-400" />
            <span>Brands</span>
          </div>
          <div className="text-lg font-semibold text-slate-100 font-mono">
            {summary.totalBrands ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Registered</span>
        </div>

        {/* Units */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Ruler className="w-3.5 h-3.5 text-amber-400" />
            <span>Units</span>
          </div>
          <div className="text-lg font-semibold text-slate-100 font-mono">
            {summary.totalUnits ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Standard & Custom</span>
        </div>

        {/* Tagged Products */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Tag className="w-3.5 h-3.5 text-rose-400" />
            <span>Tagged</span>
          </div>
          <div className="text-lg font-semibold text-slate-100 font-mono">
            {summary.totalTaggedProducts ?? 0}
          </div>
          <span className="text-[10px] text-slate-400">Classified</span>
        </div>

        {/* Avg Selling Price */}
        <div className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Avg Price</span>
          </div>
          <div className="text-base font-semibold text-slate-100 font-mono">
            {ProductMapper.formatCurrency(summary.averageSellingPrice)}
          </div>
          <span className="text-[10px] text-slate-400">Per Product</span>
        </div>
      </div>
    </div>
  );
};
