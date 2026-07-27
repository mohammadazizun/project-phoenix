import { TimelineRepository } from './TimelineRepository';
import { ActivityRecord, EntityType, TimelineFilterOptions } from './types';

export class TimelineService {
  /**
   * Fetch timeline activities matching organization and optional entity filter
   */
  public static async getTimeline(
    organizationId: string,
    filters?: TimelineFilterOptions
  ): Promise<ActivityRecord[]> {
    let activities = await TimelineRepository.getAll(
      organizationId,
      filters?.entityType,
      filters?.entityId
    );

    // Apply activityType filter
    if (filters?.activityType && filters.activityType !== 'all') {
      activities = activities.filter((a) => a.activityType === filters.activityType);
    }

    // Apply text search filter
    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.toLowerCase().trim();
      activities = activities.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.createdBy.toLowerCase().includes(q) ||
          JSON.stringify(a.metadata || {}).toLowerCase().includes(q)
      );
    }

    // Sort chronologically descending (newest first)
    activities.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (filters?.limit && filters.limit > 0) {
      activities = activities.slice(0, filters.limit);
    }

    return activities;
  }

  /**
   * Helper to format ISO timestamp into human-friendly relative time string
   */
  public static formatRelativeTime(isoString: string): string {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (isNaN(date.getTime())) return isoString;

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }

  /**
   * Record a new activity in the timeline repository
   */
  public static async recordActivity(
    activity: Omit<ActivityRecord, 'id' | 'createdAt'>
  ): Promise<ActivityRecord> {
    return TimelineRepository.create(activity);
  }
}
