import React from 'react';
import { Search, Filter, RefreshCw, History } from 'lucide-react';

interface TimelineHeaderProps {
  totalCount: number;
  selectedFilter: string;
  onFilterChange: (type: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  refreshing?: boolean;
}

export const TimelineHeader: React.FC<TimelineHeaderProps> = ({
  totalCount,
  selectedFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onRefresh,
  refreshing = false,
}) => {
  return (
    <div className="space-y-2.5 border-b border-slate-800 pb-3 text-xs">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-white">
          <span className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <History className="w-4 h-4" />
          </span>
          <h3>Audit Timeline</h3>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {totalCount} Events
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors cursor-pointer border border-slate-700"
          title="Refresh Timeline"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search timeline records..."
            className="w-full bg-slate-800/60 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Dropdown */}
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2.5 py-1.5 cursor-pointer focus:outline-none focus:border-indigo-500"
        >
          <option value="all">All Activities</option>
          <option value="customer_created">Created Only</option>
          <option value="customer_updated">Updates Only</option>
          <option value="customer_imported">Imports Only</option>
          <option value="customer_exported">Exports Only</option>
        </select>
      </div>
    </div>
  );
};
