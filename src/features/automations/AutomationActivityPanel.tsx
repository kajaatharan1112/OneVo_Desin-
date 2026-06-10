import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import { useAutomationActivityStore } from '../../store/automationActivityStore';

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export const AutomationActivityPanel: React.FC = () => {
  const { tasks, completeTask } = useAutomationActivityStore();
  const openTasks = tasks.filter(t => t.status === 'open');

  return (
    <section className="auto-activity">
      <div className="auto-activity__header">
        <h2 className="auto-activity__title">Automation Activity</h2>
        <span className="cfg-badge cfg-badge--open">{openTasks.length} open</span>
      </div>
      <p className="auto-activity__subtitle">One-time tasks created by automations appear here.</p>

      <div className="auto-activity__list">
        {tasks.length === 0 && (
          <p className="auto-condition-note">No tasks yet. Run Test on an automation with a configured one-time task step.</p>
        )}
        {tasks.map(task => (
          <article key={task.id} className={`auto-activity-card auto-activity-card--${task.status}`}>
            <div className="auto-activity-card__main">
              <div className="auto-activity-card__title-row">
                <h3 className="auto-activity-card__title">{task.title}</h3>
                <span className={`cfg-badge cfg-badge--${task.priority}`}>{task.priority}</span>
                <span className={`cfg-badge cfg-badge--${task.status === 'open' ? 'running' : 'resolved'}`}>{task.status}</span>
              </div>
              {task.description && <p className="auto-activity-card__desc">{task.description}</p>}
              <div className="auto-activity-card__meta">
                <span>Assigned to {task.assigneeLabel}</span>
                <span>Due in {task.dueLabel}</span>
                <span>Due at {formatWhen(task.dueAt)}</span>
                <span>{task.relatedEmployee}</span>
                <span>From {task.automationName}</span>
              </div>
            </div>
            {task.status === 'open' && (
              <button type="button" className="cfg-action-btn" onClick={() => completeTask(task.id)}>
                <CheckCircle2 size={13} /> Complete
              </button>
            )}
            {task.status === 'completed' && (
              <span className="auto-activity-card__done"><Clock size={12} /> Completed</span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
