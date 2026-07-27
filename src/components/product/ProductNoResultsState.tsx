/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Product Search & Filter No Results State Component
 */

import React from 'react';
import { SearchX, RotateCcw, FilterX } from 'lucide-react';
import { ProductFilterCriteria } from '../../services/productEngine/types';

interface ProductNoResultsStateProps {
  searchTerm: string;
  filterCriteria: ProductFilterCriteria;
  onResetAll: () => void;
}

export const ProductNoResultsState: React.FC<ProductNoResultsStateProps> = ({
  searchTerm,
  filterCriteria,
  onResetAll,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center shadow-xl space-y-4 max-w-xl mx-auto my-6">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
        <SearchX className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-bold text-white">No Matching Products Found</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          No product records match your current search criteria or applied filter parameters.
        </p>
      </div>

      {/* Active Filter Chips */}
      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Active Search & Filter Parameters:
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[11px]">
          {searchTerm && (
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              Search: "{searchTerm}"
            </span>
          )}
          {filterCriteria.status && filterCriteria.status !== 'all' && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              Status: {filterCriteria.status}
            </span>
          )}
          {filterCriteria.unit && filterCriteria.unit !== 'all' && (
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-300">
              Unit: {filterCriteria.unit}
            </span>
          )}
          {(filterCriteria.minPrice !== null || filterCriteria.maxPrice !== null) && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
              Price: {filterCriteria.minPrice ?? 0} - {filterCriteria.maxPrice ?? '∞'}
            </span>
          )}
        </div>
      </div>

      {/* Reset Action */}
      <div className="pt-2">
        <button
          onClick={onResetAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Clear Search & Filter Parameters</span>
        </button>
      </div>
    </div>
  );
};
