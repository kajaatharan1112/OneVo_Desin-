import React from 'react';
import { useWorkTab } from '../../hooks/use-work-tab';
import { ActiveFocusTaskCard } from './active-focus-task-card';
import { CapacityCommitmentCard } from './capacity-commitment-card';
import { TaskCastCard } from './task-cast-card';
import { WorkBlockersYesterdayCard } from './work-blockers-yesterday-card';
import { WorkKpiTiles } from './work-kpi-tiles';
import { WorkMyTasksCard } from './work-my-tasks-card';
import { WorkPriorityQueueCard } from './work-priority-queue-card';
import { WorkQuickActionsBar } from './work-quick-actions-bar';

export const WorkTab: React.FC = () => {
  const {
    isLoading,
    kpis,
    priorityQueue,
    priorityQueueCount,
    myTasks,
    taskCast,
    activeFocusTask,
    blockers,
    yesterday,
    capacity,
    quickActions
  } = useWorkTab();

  return (
    <div className="work-tab" aria-label="Work dashboard">
      <WorkKpiTiles tiles={kpis} className="work-tab__kpis" />

      <WorkPriorityQueueCard
        sections={priorityQueue}
        isLoading={isLoading}
        isEmpty={priorityQueueCount === 0}
      />
      <WorkMyTasksCard tasks={myTasks} isLoading={isLoading} isEmpty={myTasks.length === 0} />

      <TaskCastCard data={taskCast} />

      <ActiveFocusTaskCard task={activeFocusTask} />

      <WorkBlockersYesterdayCard
        blockers={blockers}
        yesterday={yesterday}
        isLoading={isLoading}
      />

      <CapacityCommitmentCard data={capacity} />

      <WorkQuickActionsBar actions={quickActions} className="work-tab__quick-bar" />
    </div>
  );
};
