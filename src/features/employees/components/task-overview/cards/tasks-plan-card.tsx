import React from 'react';
import { ListTodo } from 'lucide-react';
import type { OpenTaskItem } from '../../../types/employee-task-overview.types';
import { DashboardCard } from './dashboard-card';

const STATUS_LABELS: Record<OpenTaskItem['status'], string> = {
  open: 'Open',
  'in-progress': 'In progress',
  review: 'Review'
};

const PRIORITY_LABELS: Record<OpenTaskItem['priority'], string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low'
};

interface TasksPlanCardProps {
  tasks: OpenTaskItem[];
  openCount: number;
  backlogCount: number;
  onOpenTasks: () => void;
  className?: string;
}

export const TasksPlanCard: React.FC<TasksPlanCardProps> = ({
  tasks,
  openCount,
  backlogCount,
  onOpenTasks,
  className
}) => {
  return (
    <DashboardCard
      className={className}
      title="Tasks & plan"
      icon={<ListTodo size={15} aria-hidden="true" />}
      action={
        <button type="button" className="emp-dash-btn emp-dash-btn--ghost" onClick={onOpenTasks}>
          Open tasks
        </button>
      }
      ariaLabel="Tasks and plan"
    >
      <div className="emp-dash-highlight">
        <p className="emp-dash-highlight__title">{openCount} open items</p>
        <p className="emp-dash-highlight__desc">
          {backlogCount} backlog · urgent work is in the queue
        </p>
      </div>
      <ul className="emp-dash-scroll emp-dash-scroll--tasks" aria-label="Backlog tasks">
        {tasks.map((task) => (
          <li key={task.id} className="emp-dash-task-row">
            <div className="emp-dash-task-row__main">
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
            </div>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
};
