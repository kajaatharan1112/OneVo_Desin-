import React, { useMemo, useState } from 'react';
import { Plus, Edit, Trash2, ListChecks } from 'lucide-react';
import { ConfigShellHeader } from '../../../shared/components/config-shell-header/ConfigShellHeader';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';
import { LeaveTypeFormPanel } from './LeaveTypeFormPanel';
import { LeaveConfigToast } from './LeaveConfigToast';

export const LeaveTypesPage: React.FC = () => {
  const { leaveTypes, leaveTypeForm, openCreateLeaveType, openEditLeaveType, closeLeaveTypeForm, deleteLeaveType } =
    useLeaveConfigStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      leaveTypes.filter(
        t => !search || t.name.toLowerCase().includes(search.toLowerCase())
      ),
    [leaveTypes, search]
  );

  return (
    <div className="cfg-page">
      <ConfigShellHeader
        title="Leave Types"
        icon={<ListChecks size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search leave types...',
          label: 'Search leave types'
        }}
        actions={
          <button type="button" className="org-btn org-btn--primary" onClick={openCreateLeaveType}>
            <Plus size={14} /> Add Leave Type
          </button>
        }
      />

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Paid / Unpaid</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.id}>
                  <td>
                    <div className="cfg-table__name">{t.name}</div>
                    {t.description && <div className="cfg-table__meta">{t.description}</div>}
                  </td>
                  <td>{t.paidLeave ? 'Paid' : 'Unpaid'}</td>
                  <td><span className={`cfg-badge cfg-badge--${t.status}`}>{t.status}</span></td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      <button type="button" className="cfg-action-btn" onClick={() => openEditLeaveType(t.id)}>
                        <Edit size={13} /> Edit
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--danger"
                        onClick={() => {
                          if (window.confirm(`Delete "${t.name}"?`)) deleteLeaveType(t.id);
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

      {leaveTypeForm.open && <LeaveTypeFormPanel onClose={closeLeaveTypeForm} />}
      <LeaveConfigToast />
    </div>
  );
};
