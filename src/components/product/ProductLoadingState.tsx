/**
 * PROJECT PHOENIX - ENTERPRISE EXECUTION-011
 * Product Loading Skeleton Component
 */

import React from 'react';

export const ProductLoadingState: React.FC = () => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
      <div className="h-6 bg-slate-800 rounded-md w-1/4"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-12 bg-slate-800/60 rounded-xl w-full"></div>
        ))}
      </div>
    </div>
  );
};
