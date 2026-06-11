import { useEffect, useMemo, useState } from 'react';
import {
  workActiveFocusTask,
  workBlockers,
  workCapacityCommitment,
  workKpiTiles,
  workMyTasks,
  workPriorityQueue,
  workQuickActions,
  workTaskCast,
  workYesterdayItems
} from '../data/work-tab.mock';
import type { WorkQueueSection } from '../data/work-tab.mock';

const LOAD_DELAY_MS = 350;

function countQueueItems(sections: WorkQueueSection[]): number {
  return sections.reduce((total, section) => total + section.items.length, 0);
}

export function useWorkTab() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timerId = window.setTimeout(() => setIsLoading(false), LOAD_DELAY_MS);
    return () => window.clearTimeout(timerId);
  }, []);

  const priorityQueueCount = useMemo(() => countQueueItems(workPriorityQueue), []);

  return {
    isLoading,
    kpis: workKpiTiles,
    priorityQueue: workPriorityQueue,
    priorityQueueCount,
    myTasks: workMyTasks,
    taskCast: workTaskCast,
    activeFocusTask: workActiveFocusTask,
    blockers: workBlockers,
    yesterday: workYesterdayItems,
    capacity: workCapacityCommitment,
    quickActions: workQuickActions
  };
}
