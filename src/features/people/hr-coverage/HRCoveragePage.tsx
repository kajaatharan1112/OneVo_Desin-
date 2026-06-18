import React, { useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useHRCoverageStore } from './hrCoverageStore';
import { HRCoverageModal } from './HRCoverageModal';
import { countEmployeesCovered, formatAccessAllowed, formatCoverageScope } from './hrCoverageUtils';

const HRCoverageToast: React.FC = () => {
  const { toast, clearToast } = useHRCoverageStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);
  if (!toast) return null;
  return (
    <div className="schedules-cfg-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">×</button>
    </div>
  );
};

export const HRCoveragePage: React.FC = () => {
  const { rules, openCreate, openEdit, deleteRule } = useHRCoverageStore();

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">HR Coverage</h1>
          <p className="cfg-page__subtitle">
            Assign HR responsibility by department or position. HR coverage controls which employees
            HR users can view and manage.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreate}>
          <Plus size={14} /> Add Coverage
        </button>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>HR Person / Position</th>
                <th>Coverage</th>
                <th>Employees Covered</th>
                <th>Access</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td>
                    <span className="cfg-table__name">{rule.ownerLabel}</span>
                  </td>
                  <td>{formatCoverageScope(rule)}</td>
                  <td>{countEmployeesCovered(rule)}</td>
                  <td className="hr-coverage-table__access">{formatAccessAllowed(rule.accessAllowed)}</td>
                  <td>
                    <span
                      className={`cfg-badge cfg-badge--${rule.status === 'active' ? 'active' : 'inactive'}`}
                    >
                      {rule.status}
                    </span>
                  </td>
                  <td>
                    <div className="cfg-row-actions">
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--icon"
                        onClick={() => openEdit(rule.id)}
                        aria-label={`Edit ${rule.ownerLabel}`}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--icon cfg-action-btn--danger"
                        onClick={() => {
                          if (window.confirm(`Remove coverage for "${rule.ownerLabel}"?`)) {
                            deleteRule(rule.id);
                          }
                        }}
                        aria-label={`Delete ${rule.ownerLabel}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <HRCoverageModal />
      <HRCoverageToast />
    </div>
  );
};
