/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-014
 * Product Toolbar Component with Master Data Modals Integration (v3.5)
 */

import React from 'react';
import {
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  RotateCcw,
  Loader2,
  FolderTree,
  Bookmark,
  Ruler,
  Tag as TagIcon,
} from 'lucide-react';
import { ProductStatus, ProductSortField, ProductSortOrder, PRODUCT_STATUSES } from '../../services/productEngine/types';

interface ProductToolbarProps {
  searchInput: string;
  onSearchChange: (val: string) => void;
  onClearSearch: () => void;
  isSearching?: boolean;

  selectedStatus: ProductStatus | 'all';
  onStatusChange: (status: ProductStatus | 'all') => void;

  sortField: ProductSortField;
  sortOrder: ProductSortOrder;
  onSortChange: (field: ProductSortField, order: ProductSortOrder) => void;

  isFilterPanelOpen: boolean;
  onToggleFilterPanel: () => void;
  activeFilterCount: number;

  hasActiveSearchOrFilter: boolean;
  onResetAll: () => void;

  // Master Data Trigger Handlers
  onOpenCategoryManager?: () => void;
  onOpenBrandManager?: () => void;
  onOpenUnitManager?: () => void;
  onOpenTagManager?: () => void;
}

export const ProductToolbar: React.FC<ProductToolbarProps> = ({
  searchInput,
  onSearchChange,
  onClearSearch,
  isSearching = false,
  selectedStatus,
  onStatusChange,
  sortField,
  sortOrder,
  onSortChange,
  isFilterPanelOpen,
  onToggleFilterPanel,
  activeFilterCount,
  hasActiveSearchOrFilter,
  onResetAll,
  onOpenCategoryManager,
  onOpenBrandManager,
  onOpenUnitManager,
  onOpenTagManager,
}) => {
  const sortOptions: { label: string; field: ProductSortField; order: ProductSortOrder }[] = [
    { label: 'Name (A → Z)', field: 'productName', order: 'asc' },
    { label: 'Name (Z → A)', field: 'productName', order: 'desc' },
    { label: 'SKU (A → Z)', field: 'sku', order: 'asc' },
    { label: 'Price: Low to High', field: 'sellingPrice', order: 'asc' },
    { label: 'Price: High to Low', field: 'sellingPrice', order: 'desc' },
    { label: 'Base Cost: Low to High', field: 'basePrice', order: 'asc' },
    { label: 'Base Cost: High to Low', field: 'basePrice', order: 'desc' },
    { label: 'Newest First', field: 'createdAt', order: 'desc' },
    { label: 'Oldest First', field: 'createdAt', order: 'asc' },
    { label: 'Recently Updated', field: 'updatedAt', order: 'desc' },
  ];

  const currentSortKey = `${sortField}_${sortOrder}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
      {/* Master Data Quick Tools Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
          Master Lookup Registers:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {onOpenCategoryManager && (
            <button
              onClick={onOpenCategoryManager}
              className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FolderTree className="w-3.5 h-3.5 text-blue-400" />
              <span>Categories</span>
            </button>
          )}

          {onOpenBrandManager && (
            <button
              onClick={onOpenBrandManager}
              className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5 text-purple-400" />
              <span>Brands</span>
            </button>
          )}

          {onOpenUnitManager && (
            <button
              onClick={onOpenUnitManager}
              className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Units</span>
            </button>
          )}

          {onOpenTagManager && (
            <button
              onClick={onOpenTagManager}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <TagIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Tags</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Real-time Search Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </div>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search catalog by SKU, Barcode, Product Name, Category, or Brand..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-medium"
          />
          {searchInput && (
            <button
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls Right */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Advanced Filter Panel Toggle */}
          <button
            onClick={onToggleFilterPanel}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isFilterPanelOpen || activeFilterCount > 0
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-mono text-[10px]">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="relative flex items-center">
            <div className="absolute left-3 pointer-events-none text-slate-400">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <select
              value={currentSortKey}
              onChange={(e) => {
                const [f, o] = e.target.value.split('_');
                onSortChange(f as ProductSortField, o as ProductSortOrder);
              }}
              className="pl-9 pr-8 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              {sortOptions.map((opt) => (
                <option key={`${opt.field}_${opt.order}`} value={`${opt.field}_${opt.order}`}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset All */}
          {hasActiveSearchOrFilter && (
            <button
              onClick={onResetAll}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all cursor-pointer"
              title="Reset all search queries and active filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Status Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs border-t border-slate-800/60 pt-3">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mr-2 shrink-0">
          Status:
        </span>

        <button
          onClick={() => onStatusChange('all')}
          className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 ${
            selectedStatus === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Statuses
        </button>

        {PRODUCT_STATUSES.map((st) => {
          const isActive = selectedStatus === st.key;
          return (
            <button
              key={st.key}
              onClick={() => onStatusChange(st.key)}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isActive
                  ? `${st.bgColor} ${st.color} border ${st.borderColor}`
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>{st.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
