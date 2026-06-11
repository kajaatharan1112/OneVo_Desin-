import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
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
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Leave Types</h1>
          <p className="cfg-page__subtitle">Define what kinds of leave exist in the company.</p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreateLeaveType}>
          <Plus size={14} /> Add Leave Type
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search leave types…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

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
