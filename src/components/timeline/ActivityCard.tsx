import React from 'react';
import { ActivityRecord } from '../../services/timelineEngine/types';
import { TimelineService } from '../../services/timelineEngine/TimelineService';
import { ActivityBadge } from './ActivityBadge';
import { Clock, User, ChevronRight, Info } from 'lucide-react';

interface ActivityCardProps {
  activity: ActivityRecord;
  onClickDetail: (activity: ActivityRecord) => void;
  isLast?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onClickDetail,
  isLast = false,
}) => {
  return (
    <div className="relative flex gap-3 text-xs group">
      {/* Timeline Connecting Line */}
      {!isLast && (
        <span
          className="absolute left-4 top-9 -bottom-3 w-0.5 bg-slate-800 group-hover:bg-indigo-500/30 transition-colors"
          aria-hidden="true"
        />
      )}

      {/* Badge Icon */}
      <div className="z-10 shrink-0">
        <ActivityBadge activityType={activity.activityType} size="md" />
      </div>

      {/* Card Box */}
      <div
        onClick={() => onClickDetail(activity)}
        className="flex-1 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 space-y-2 cursor-pointer transition-all shadow-sm hover:shadow-md"
      >
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-slate-100 text-xs group-hover:text-indigo-300 transition-colors">
              {activity.title}
            </h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-500" />
                <span>{activity.createdBy}</span>
              </span>
              &bull;
              <span className="flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>{TimelineService.formatRelativeTime(activity.createdAt)}</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="text-slate-500 group-hover:text-slate-300 p-1 rounded hover:bg-slate-700/50 transition-colors"
            title="View Activity Details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Card Description */}
        <p className="text-slate-300 text-[11px] leading-relaxed">{activity.description}</p>

        {/* Metadata Preview Chips */}
        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/60">
            {Object.entries(activity.metadata)
              .slice(0, 3)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900/60 text-slate-400 border border-slate-800"
                >
                  <strong className="text-slate-300 capitalize">{key}:</strong>{' '}
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              ))}
            {Object.keys(activity.metadata).length > 3 && (
              <span className="text-[10px] text-indigo-400 font-mono font-bold self-center ml-1">
                +{Object.keys(activity.metadata).length - 3} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
