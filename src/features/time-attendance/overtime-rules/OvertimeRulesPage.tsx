import React, { useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useOvertimeRulesStore } from './overtimeRulesStore';
import { OvertimeRuleModal } from './OvertimeRuleModal';
import {
  formatAppliesTo,
  formatApproval,
  formatPayrollRate,
  formatThreshold,
  formatTrigger
} from './overtimeRulesUtils';

const OvertimeRulesToast: React.FC = () => {
  const { toast, clearToast } = useOvertimeRulesStore();
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 3500);
    return () => clearTimeout(t);
  }, [toast, clearToast]);
  if (!toast) return null;
  return (
    <div className="schedules-cfg-toast" role="status">
      {toast}
      <button type="button" onClick={clearToast} aria-label="Dismiss">
        ×
      </button>
    </div>
  );
};

export const OvertimeRulesPage: React.FC = () => {
  const { rules, openCreateRule, openEditRule, deleteRule } = useOvertimeRulesStore();
  const { employees, departments, positions } = useOrganizationStore();

  const scopeCtx = useMemo(
    () => ({ employees, departments, positions }),
    [employees, departments, positions]
  );

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Overtime Rules</h1>
          <p className="cfg-page__subtitle">
            Configure how overtime is detected, approved, and paid based on employee schedules.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreateRule}>
          <Plus size={14} /> Add Overtime Rule
        </button>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Applies To</th>
                <th>Trigger</th>
                <th>Threshold</th>
                <th>Approval</th>
                <th>Payroll Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td>
                    <span className="cfg-table__name">{rule.name}</span>
                  </td>
                  <td>{formatAppliesTo(rule, scopeCtx)}</td>
                  <td>{formatTrigger(rule)}</td>
                  <td>{formatThreshold(rule)}</td>
                  <td>{formatApproval(rule, scopeCtx)}</td>
                  <td>{formatPayrollRate(rule)}</td>
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
                        onClick={() => openEditRule(rule.id)}
                        aria-label={`Edit ${rule.name}`}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--icon cfg-action-btn--danger"
                        onClick={() => {
                          if (window.confirm(`Delete "${rule.name}"?`)) deleteRule(rule.id);
                        }}
                        aria-label={`Delete ${rule.name}`}
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

      <OvertimeRuleModal />
      <OvertimeRulesToast />
    </div>
  );
};
