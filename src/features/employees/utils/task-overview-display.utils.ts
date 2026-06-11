import type { OpenTaskItem, PriorityQueueGroup } from '../types/employee-task-overview.types';

export function getPriorityQueueTitles(groups: PriorityQueueGroup[]): Set<string> {
  return new Set(groups.flatMap((group) => group.items.map((item) => item.title)));
}

export function getBacklogTasks(
  tasks: OpenTaskItem[],
  priorityTitles: Set<string>
): OpenTaskItem[] {
  return tasks.filter((task) => !priorityTitles.has(task.title));
}
