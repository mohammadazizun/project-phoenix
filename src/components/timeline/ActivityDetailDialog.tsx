import React from 'react';
import { ActivityRecord } from '../../services/timelineEngine/types';
import { TimelineService } from '../../services/timelineEngine/TimelineService';
import { ActivityBadge } from './ActivityBadge';
import { X, Calendar, User, Tag, Layers, Database, Code } from 'lucide-react';

interface ActivityDetailDialogProps {
  isOpen: boolean;
  activity: ActivityRecord | null;
  onClose: () => void;
}

export const ActivityDetailDialog: React.FC<ActivityDetailDialogProps> = ({
  isOpen,
  activity,
  onClose,
}) => {
  if (!isOpen || !activity) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <ActivityBadge activityType={activity.activityType} size="md" />
            <div>
              <h3 className="text-sm font-bold text-white">{activity.title}</h3>
              <p className="text-[10px] text-slate-400 font-mono">
                ID: {activity.id} &bull; {TimelineService.formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-3">
          <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Activity Description
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">{activity.description}</p>
          </div>

          {/* Context Details */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Performed By</div>
                <div className="font-semibold text-slate-200">{activity.createdBy}</div>
              </div>
            </div>

            <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Timestamp</div>
                <div className="font-mono text-slate-200">
                  {activity.createdAt.replace('T', ' ').substring(0, 19)}
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Target Entity</div>
                <div className="font-semibold text-slate-200">
                  {activity.entityType} ({activity.entityId})
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 p-2.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-500">Activity Code</div>
                <div className="font-mono text-indigo-300 font-bold">{activity.activityType}</div>
              </div>
            </div>
          </div>

          {/* JSON Metadata Payload */}
          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span>Structured Metadata Payload</span>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40">
                {JSON.stringify(activity.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
