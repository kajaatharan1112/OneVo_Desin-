import { useMemo } from 'react';
import {
  blockerRiskItems,
  openTasks,
  priorityWorkQueue,
  quickWorkActions,
  taskCompletionMetrics,
  weeklyTaskTimeline,
  yesterdayStatusItems
} from '../data/employee-task-overview.data';
import {
  getBacklogTasks,
  getPriorityQueueTitles
} from '../utils/task-overview-display.utils';

const BACKLOG_TASKS_VISIBLE_MAX = 4;
const PRIORITY_ROWS_VISIBLE_MAX = 4;
const YESTERDAY_ROWS_VISIBLE_MAX = 4;

export function useEmployeeTaskOverview() {
  const openTaskCount = useMemo(() => openTasks.length, []);

  const priorityQueueTitles = useMemo(
    () => getPriorityQueueTitles(priorityWorkQueue),
    []
  );

  const backlogTasks = useMemo(
    () => getBacklogTasks(openTasks, priorityQueueTitles),
    [priorityQueueTitles]
  );

  const visibleBacklogTasks = useMemo(
    () => backlogTasks.slice(0, BACKLOG_TASKS_VISIBLE_MAX),
    [backlogTasks]
  );

  const priorityQueueRows = useMemo(
    () =>
      priorityWorkQueue.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          groupId: group.id,
          groupTitle: group.title
        }))
      ),
    []
  );

  const highlightedBlockers = useMemo(
    () =>
      blockerRiskItems
        .filter((item) => item.severity === 'high')
        .concat(blockerRiskItems.filter((item) => item.severity === 'medium').slice(0, 1)),
    []
  );

  const taskCompletionPercent = useMemo(() => {
    const { completed, planned } = taskCompletionMetrics;
    return planned > 0 ? Math.round((completed / planned) * 100) : 0;
  }, []);

  return {
    backlogTasks: visibleBacklogTasks,
    backlogTaskCount: backlogTasks.length,
    openTaskCount,
    taskCompletionMetrics,
    taskCompletionPercent,
    priorityWorkQueue,
    priorityQueueRows,
    priorityRowsVisibleMax: PRIORITY_ROWS_VISIBLE_MAX,
    weeklyTaskTimeline,
    yesterdayStatusItems,
    yesterdayRowsVisibleMax: YESTERDAY_ROWS_VISIBLE_MAX,
    blockerRiskItems: highlightedBlockers,
    quickWorkActions
  };
}
