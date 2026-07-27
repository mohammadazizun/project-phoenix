import React from 'react';
import { Activity, Clock } from 'lucide-react';

export const TimelineSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 shrink-0" />
          <div className="flex-1 bg-slate-800/40 border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="h-3.5 bg-slate-800 rounded w-1/3" />
            <div className="h-3 bg-slate-800/60 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const TimelineEmptyState: React.FC<{ filterActive?: boolean }> = ({ filterActive }) => {
  return (
    <div className="text-center py-10 px-4 space-y-3 bg-slate-800/20 rounded-2xl border border-slate-800/60">
      <div className="w-10 h-10 rounded-full bg-slate-800/80 text-slate-500 flex items-center justify-center mx-auto border border-slate-700">
        <Clock className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-slate-300">No Activity History Found</h4>
        <p className="text-[11px] text-slate-500 mt-0.5">
          {filterActive
            ? 'No records match your active search or filter criteria.'
            : 'Activities will automatically record as business events take place.'}
        </p>
      </div>
    </div>
  );
};
