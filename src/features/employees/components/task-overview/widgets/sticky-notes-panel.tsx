import React from 'react';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';
import { useEmployeeData } from '../../../hooks/use-employee-data';

interface StickyNotesPanelProps {
  onOpenTasks: () => void;
}

function statusIcon(done: boolean) {
  return done ? <CheckCircle2 size={14} /> : <Circle size={14} />;
}

export const StickyNotesPanel: React.FC<StickyNotesPanelProps> = ({ onOpenTasks }) => {
  const { pendingTasks, todayPlanTasks } = useEmployeeData();
  const pendingCount = pendingTasks.filter((t) => !t.done).length;
  const todayOpenCount = todayPlanTasks.filter((t) => !t.done).length;

  const combinedTasks = [
    ...pendingTasks.map((task) => ({
      id: task.id,
      title: task.label,
      detail: task.done ? 'Pending queue · Finished' : 'Pending queue · Not finished',
      done: task.done
    })),
    ...todayPlanTasks.map((task) => ({
      id: task.id,
      title: task.label,
      detail: task.done ? 'Today plan · Finished' : 'Today plan · Not finished',
      done: task.done
    }))
  ].slice(0, 5);

  return (
    <button
      type="button"
      className="eto-widget eto-widget--clickable eto-status-panel eto-cell--sticky"
      onClick={onOpenTasks}
    >
      <header className="eto-widget__head">
        <ListTodo size={16} aria-hidden="true" />
        <h3 className="eto-widget__title">Tasks & plan</h3>
        <span className="eto-widget__meta">Open tasks</span>
      </header>

      <div className="eto-status-panel__banner">
        <p className="eto-status-panel__banner-title">
          {pendingCount + todayOpenCount} open items
        </p>
        <p className="eto-status-panel__banner-desc">
          {pendingCount} pending · {todayPlanTasks.length} today plan · tap to open Task page
        </p>
      </div>

      <ul className="eto-status-panel__list">
        {combinedTasks.map((task) => (
          <li key={task.id} className="eto-status-panel__item">
            <span
              className={`eto-status-panel__icon${task.done ? ' eto-status-panel__icon--done' : ''}`}
              aria-hidden="true"
            >
              {statusIcon(task.done)}
            </span>
            <div className="eto-status-panel__copy">
              <span className="eto-status-panel__title">{task.title}</span>
              <span className="eto-status-panel__detail">{task.detail}</span>
            </div>
          </li>
        ))}
      </ul>
    </button>
  );
};
