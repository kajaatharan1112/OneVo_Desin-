import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import { accrualLabel, formatAppliesTo } from './leaveConfigUtils';
import { LeavePolicyFormPanel } from './LeavePolicyFormPanel';
import { LeaveConfigToast } from './LeaveConfigToast';

export const LeavePoliciesPage: React.FC = () => {
  const { policies, leaveTypes, policyForm, openCreatePolicy, openEditPolicy, closePolicyForm, deletePolicy } =
    useLeaveConfigStore();
  const { departments, positions } = useOrganizationStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => policies.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase())),
    [policies, search]
  );

  const typeName = (id: string) => leaveTypes.find(t => t.id === id)?.name ?? '—';

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Leave Policies</h1>
          <p className="cfg-page__subtitle">
            Define leave rules and assign them to the company, departments, or positions.
          </p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreatePolicy}>
          <Plus size={14} /> Add Policy
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search policies…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Policy Name</th>
                <th>Leave Type</th>
                <th>Applies To</th>
                <th>Limit</th>
                <th>Accrual</th>
                <th>Effective From</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div className="cfg-table__name">{p.name}</div>
                    {p.description && <div className="cfg-table__meta">{p.description}</div>}
                  </td>
                  <td>{typeName(p.leaveTypeId)}</td>
                  <td>{formatAppliesTo(p, departments, positions)}</td>
                  <td>{p.limitValue} {p.limitUnit} / {p.limitPeriod === 'yearly' ? 'yr' : 'mo'}</td>
                  <td>{accrualLabel(p.accrualMethod)}</td>
                  <td>{p.effectiveFrom}</td>
                  <td><span className={`cfg-badge cfg-badge--${p.status}`}>{p.status}</span></td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      <button type="button" className="cfg-action-btn" onClick={() => openEditPolicy(p.id)}>
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--danger"
                        onClick={() => {
                          if (window.confirm(`Delete "${p.name}"?`)) deletePolicy(p.id);
                        }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {policyForm.open && <LeavePolicyFormPanel onClose={closePolicyForm} />}
      <LeaveConfigToast />
    </div>
  );
};
