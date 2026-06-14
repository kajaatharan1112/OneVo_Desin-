import React from 'react';
import { useWork } from '../context/work-context';
import { accessiblePlanner, formatWorkDate, workspaceLabel } from '../workMockData';

const TYPE_LABELS = { board: 'Board', sprint: 'Sprint', milestone: 'Milestone', roadmap: 'Roadmap', cycle: 'Cycle' };

export const PlannerPage: React.FC = () => {
  const { workspaceFilterId, workspaces } = useWork();
  const items = accessiblePlanner(workspaceFilterId);

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Planner</h1>
          <p className="cfg-page__subtitle">
            Boards, sprints, milestones, and roadmap across {workspaceLabel(workspaceFilterId, workspaces).toLowerCase()}.
          </p>
        </div>
      </div>
      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Project</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><span className="cfg-badge cfg-badge--open">{TYPE_LABELS[item.type]}</span></td>
                  <td className="cfg-table__name">{item.name}</td>
                  <td>{item.projectName}</td>
                  <td>{formatWorkDate(item.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="cfg-empty"><p className="cfg-empty__title">No planning items in this workspace context</p></div>
          )}
        </div>
      </div>
    </div>
  );
};
