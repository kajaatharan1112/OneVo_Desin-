import React from 'react';
import { useWork } from '../context/work-context';
import { accessibleDocuments, workspaceLabel } from '../workMockData';
import { formatRelativeTime } from '../../settings/settingsMockData';

export const DocumentsPage: React.FC = () => {
  const { workspaceFilterId, workspaces } = useWork();
  const docs = accessibleDocuments(workspaceFilterId);

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Documents</h1>
          <p className="cfg-page__subtitle">
            Work and project documents in {workspaceLabel(workspaceFilterId, workspaces).toLowerCase()}.
          </p>
        </div>
      </div>
      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Project</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id}>
                  <td className="cfg-table__name">{d.name}</td>
                  <td>{d.projectName}</td>
                  <td>{formatRelativeTime(d.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {docs.length === 0 && (
            <div className="cfg-empty"><p className="cfg-empty__title">No documents in this workspace context</p></div>
          )}
        </div>
      </div>
    </div>
  );
};
