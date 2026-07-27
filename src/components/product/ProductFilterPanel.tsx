/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-013
 * Expandable Product Filter Panel Component
 */

import React from 'react';
import { X, Filter, DollarSign, Calendar, Layers, RotateCcw } from 'lucide-react';
import { PRODUCT_UNITS, ProductFilterCriteria } from '../../services/productEngine/types';
import { TenantContext } from '../../types';

interface ProductFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  criteria: ProductFilterCriteria;
  onUnitChange: (unit: string | 'all') => void;
  onPriceRangeChange: (min: number | null, max: number | null) => void;
  onDateRangeChange: (start: string | null, end: string | null) => void;
  onResetFilters: () => void;
  tenant: TenantContext;
}

export const ProductFilterPanel: React.FC<ProductFilterPanelProps> = ({
  isOpen,
  onClose,
  criteria,
  onUnitChange,
  onPriceRangeChange,
  onDateRangeChange,
  onResetFilters,
  tenant,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5 animate-fade-in text-xs text-slate-300">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <h4 className="font-bold text-sm text-white">Advanced Catalog Filters</h4>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Measurement Unit */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Measurement Unit</span>
          </label>
          <select
            value={criteria.unit || 'all'}
            onChange={(e) => onUnitChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Units</option>
            {PRODUCT_UNITS.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Selling Price Range ({tenant.currency})</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min Price"
              min="0"
              value={criteria.minPrice ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                onPriceRangeChange(val, criteria.maxPrice ?? null);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="Max Price"
              min="0"
              value={criteria.maxPrice ?? ''}
              onChange={(e) => {
                const val = e.target.value === '' ? null : parseFloat(e.target.value);
                onPriceRangeChange(criteria.minPrice ?? null, val);
              }}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Created Date Range */}
        <div className="space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Registration Date Range</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={criteria.startDate || ''}
              onChange={(e) => onDateRangeChange(e.target.value || null, criteria.endDate || null)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
            <input
              type="date"
              value={criteria.endDate || ''}
              onChange={(e) => onDateRangeChange(criteria.startDate || null, e.target.value || null)}
              className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-[11px] focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Panel Footer Actions */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <span className="text-[10px] text-slate-500 font-mono">
          URL parameter state synchronized on apply
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Criteria</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
