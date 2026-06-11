import React from 'react';
import { ListTodo } from 'lucide-react';
import type { WorkMyTaskItem, WorkPriority, WorkTaskStatus } from '../../data/work-tab.mock';
import { DashboardCard } from './cards/dashboard-card';
import { WorkScrollBody } from './work-scroll-body';

const STATUS_LABELS: Record<WorkTaskStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  review: 'Review'
};

const PRIORITY_LABELS: Record<WorkPriority, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

interface WorkMyTasksCardProps {
  tasks: WorkMyTaskItem[];
  isLoading: boolean;
  isEmpty: boolean;
  className?: string;
}

export const WorkMyTasksCard: React.FC<WorkMyTasksCardProps> = ({
  tasks,
  isLoading,
  isEmpty,
  className = ''
}) => {
  return (
    <DashboardCard
      title="My Tasks"
      icon={<ListTodo size={15} aria-hidden="true" />}
      scroll
      className={`work-tab__cell work-tab__cell--scroll ${className}`.trim()}
      ariaLabel="My tasks"
    >
      <WorkScrollBody
        isLoading={isLoading}
        isEmpty={isEmpty}
        emptyLabel="No tasks assigned to you."
        loadingLabel="Loading your tasks…"
      >
        <ul className="work-scroll-list work-scroll-list--tasks" aria-label="My task list">
          {tasks.map((task) => (
            <li key={task.id} className="emp-dash-task-row">
              <span className="emp-dash-task-row__title">{task.title}</span>
              <span className="emp-dash-task-row__meta">
                <span className={`emp-dash-chip emp-dash-chip--status-${task.status}`}>
                  {STATUS_LABELS[task.status]}
                </span>
                <span className={`emp-dash-chip emp-dash-chip--priority-${task.priority}`}>
                  {PRIORITY_LABELS[task.priority]}
                </span>
                <span className="emp-dash-task-row__due">{task.dueLabel}</span>
              </span>
            </li>
          ))}
        </ul>
      </WorkScrollBody>
    </DashboardCard>
  );
};
