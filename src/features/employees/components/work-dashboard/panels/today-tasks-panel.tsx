import React, { useState } from 'react';
import { Clock3, Building2, User, Timer, ChevronDown } from 'lucide-react';
import type { WorkDashboardTodayTask } from '../../../data/work-dashboard.data';
import { WorkDashboardPanel } from '../work-dashboard-panel';

interface TodayTasksPanelProps {
  tasks: WorkDashboardTodayTask[];
  highlight: { label: string; detail: string };
}

export const TodayTasksPanel: React.FC<TodayTasksPanelProps> = ({ tasks, highlight }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setSelectedTaskId((prev) => (prev === id ? null : id));

  return (
    <WorkDashboardPanel title="Tasks & plan" className="work-dashboard__today-tasks">
      <div className="wd-highlight">
        <span className="wd-highlight__label">{highlight.label}</span>
        <span className="wd-highlight__detail">{highlight.detail}</span>
      </div>

      <ul className="wd-task-list work-dashboard-scroll" aria-label="Tasks assigned for today">
        {tasks.map((task) => {
          const isOpen = task.id === selectedTaskId;

          return (
            <li
              key={task.id}
              className={`wd-task-item${isOpen ? ' wd-task-item--open' : ''}`}
            >
              <button
                type="button"
                className="wd-task-item__trigger"
                onClick={() => toggle(task.id)}
                aria-expanded={isOpen}
              >
                {/* Header — grid: title row + meta row (no overlap) */}
                <span className="wd-task-item__head">
                  <span
                    className={`wd-task-item__icon${isOpen ? ' wd-task-item__icon--active' : ''}`}
                    aria-hidden="true"
                  />
                  <span className="wd-task-item__title">{task.title}</span>
                  <span className="wd-task-item__due">{task.dueLabel}</span>
                  <ChevronDown
                    size={12}
                    className="wd-task-item__chevron"
                    aria-hidden="true"
                  />
                  <span className="wd-task-meta-row">
                    <span className="wd-task-meta-inline">
                      <span className="wd-task-meta-item">
                        <Building2 size={10} aria-hidden="true" />
                        {task.workplace}
                      </span>
                      <span className="wd-task-meta-dot" aria-hidden="true">·</span>
                      <span className="wd-task-meta-item">
                        <User size={10} aria-hidden="true" />
                        {task.assignedBy}
                      </span>
                    </span>
                    <span className="wd-task-chip wd-task-chip--time">
                      <Timer size={10} aria-hidden="true" />
                      {task.allocatedTime}
                    </span>
                  </span>
                </span>

                {/* Expand panel — always in DOM for smooth animation */}
                <span className="wd-task-expand" aria-hidden={!isOpen}>
                  <span className="wd-task-expand__inner">
                    <span className="wd-task-expand__content">
                      <span className="wd-task-expand__desc">{task.description}</span>
                      <span className="wd-task-expand__footer">
                        <button
                          type="button"
                          className="wd-task-expand__btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Clock3 size={13} aria-hidden="true" />
                          Clock in to task
                        </button>
                        <span className="wd-task-expand__due">{task.dueLabel}</span>
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </WorkDashboardPanel>
  );
};
