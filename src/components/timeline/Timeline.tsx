import React, { useState, useEffect } from 'react';
import { ActivityRecord, EntityType } from '../../services/timelineEngine/types';
import { TimelineService } from '../../services/timelineEngine/TimelineService';
import { TimelineHeader } from './TimelineHeader';
import { ActivityCard } from './ActivityCard';
import { ActivityDetailDialog } from './ActivityDetailDialog';
import { TimelineSkeleton, TimelineEmptyState } from './TimelineStateViews';

interface TimelineProps {
  organizationId: string;
  entityType?: EntityType;
  entityId?: string;
  className?: string;
  maxHeight?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  organizationId,
  entityType,
  entityId,
  className = '',
  maxHeight = 'max-h-[450px]',
}) => {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Activity for Detail Modal
  const [selectedActivity, setSelectedActivity] = useState<ActivityRecord | null>(null);

  const loadTimeline = async (showRefreshSpin = false) => {
    if (showRefreshSpin) setRefreshing(true);
    else setLoading(true);

    try {
      const records = await TimelineService.getTimeline(organizationId, {
        entityType,
        entityId,
        activityType: filterType,
        search: searchQuery,
      });

      setActivities(records);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTimeline();
  }, [organizationId, entityType, entityId, filterType, searchQuery]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header controls */}
      <TimelineHeader
        totalCount={activities.length}
        selectedFilter={filterType}
        onFilterChange={setFilterType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={() => loadTimeline(true)}
        refreshing={refreshing}
      />

      {/* Timeline List Body */}
      <div className={`overflow-y-auto space-y-3 pr-1 ${maxHeight}`}>
        {loading ? (
          <TimelineSkeleton />
        ) : activities.length === 0 ? (
          <TimelineEmptyState filterActive={filterType !== 'all' || searchQuery !== ''} />
        ) : (
          activities.map((act, idx) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onClickDetail={(activity) => setSelectedActivity(activity)}
              isLast={idx === activities.length - 1}
            />
          ))
        )}
      </div>

      {/* Activity Detail Modal */}
      <ActivityDetailDialog
        isOpen={Boolean(selectedActivity)}
        activity={selectedActivity}
        onClose={() => setSelectedActivity(null)}
      />
    </div>
  );
};
