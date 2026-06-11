import React, { useEffect, useState } from 'react';
import { Pause, Play, Timer } from 'lucide-react';
import type { WorkActiveFocusTask } from '../../data/work-tab.mock';
import { formatElapsedSeconds } from '../../utils/work-timer.utils';
import { DashboardCard } from './cards/dashboard-card';

interface ActiveFocusTaskCardProps {
  task: WorkActiveFocusTask;
  className?: string;
}

export const ActiveFocusTaskCard: React.FC<ActiveFocusTaskCardProps> = ({
  task,
  className = ''
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(task.initialElapsedSeconds);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timerId = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [paused]);

  return (
    <DashboardCard
      title="Active Focus Task"
      icon={<Timer size={15} aria-hidden="true" />}
      className={`work-tab__cell work-tab__cell--static ${className}`.trim()}
      ariaLabel="Active focus task"
    >
      <div className="work-focus-task">
        <p className="work-focus-task__title">{task.title}</p>
        <div className="work-focus-task__timer-row">
          <time className="work-focus-task__timer" dateTime={`PT${elapsedSeconds}S`}>
            {formatElapsedSeconds(elapsedSeconds)}
          </time>
          <button
            type="button"
            className="work-focus-task__toggle"
            onClick={() => setPaused((value) => !value)}
            aria-pressed={paused}
            aria-label={paused ? 'Resume timer' : 'Pause timer'}
          >
            {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            <span>{paused ? 'Resume' : 'Pause'}</span>
          </button>
        </div>
        <div className="work-focus-task__meta">
          <span className="work-focus-task__sprint">{task.sprint}</span>
          <span className="work-focus-task__due">Due {task.due}</span>
        </div>
      </div>
    </DashboardCard>
  );
};
