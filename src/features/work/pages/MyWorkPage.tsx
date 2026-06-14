import React from 'react';
import { useWork } from '../context/work-context';
import { accessibleTasks, formatWorkDate, workspaceLabel } from '../workMockData';

export const MyWorkPage: React.FC = () => {
  const { workspaceFilterId, workspaces } = useWork();
  const tasks = accessibleTasks(workspaceFilterId);

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">My Work</h1>
          <p className="cfg-page__subtitle">
            Tasks assigned to you in {workspaceLabel(workspaceFilterId, workspaces).toLowerCase()}.
          </p>
        </div>
      </div>
      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td className="cfg-table__name">{t.title}</td>
                  <td>{t.projectName}</td>
                  <td><span className="cfg-badge cfg-badge--open">{t.status.replace('_', ' ')}</span></td>
                  <td>{t.priority}</td>
                  <td>{formatWorkDate(t.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {tasks.length === 0 && (
            <div className="cfg-empty"><p className="cfg-empty__title">No tasks in this workspace context</p></div>
          )}
        </div>
      </div>
    </div>
  );
};
