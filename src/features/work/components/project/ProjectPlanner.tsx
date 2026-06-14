import React from 'react';
import { formatWorkDate, MOCK_PLANNER, type WorkProject } from '../../workMockData';

interface Props {
  project: WorkProject;
}

export const ProjectPlanner: React.FC<Props> = ({ project }) => {
  const items = MOCK_PLANNER.filter(p => p.projectId === project.id);
  const milestones = items.filter(p => p.type === 'milestone');
  const roadmaps = items.filter(p => p.type === 'roadmap' || p.type === 'board');

  return (
    <div className="work-screen">
      <section className="work-panel work-panel--wide">
        <h3 className="work-panel__title">Timeline</h3>
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead><tr><th>Item</th><th>Type</th><th>Due</th><th>Status</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td className="cfg-table__name">{item.name}</td>
                  <td>{item.type}</td>
                  <td>{formatWorkDate(item.date)}</td>
                  <td><span className="cfg-badge cfg-badge--open">{item.status ?? 'planned'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="cfg-empty"><p className="cfg-empty__title">No planned items</p></div>}
        </div>
      </section>

      <div className="work-cycle-columns">
        <section className="work-panel">
          <h3 className="work-panel__title">Milestones</h3>
          {milestones.length === 0 ? (
            <p className="admin-hint">No milestones yet.</p>
          ) : (
            <ul className="work-mini-list">
              {milestones.map(m => (
                <li key={m.id}>
                  <span>{m.name}</span>
                  <span className="work-mini-list__meta">{formatWorkDate(m.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="work-panel">
          <h3 className="work-panel__title">Planned work</h3>
          {roadmaps.length === 0 ? (
            <p className="admin-hint">No roadmap items.</p>
          ) : (
            <ul className="work-mini-list">
              {roadmaps.map(r => (
                <li key={r.id}>
                  <span>{r.name}</span>
                  <span className="work-mini-list__meta">{formatWorkDate(r.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};
