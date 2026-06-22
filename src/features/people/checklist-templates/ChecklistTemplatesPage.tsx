import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Copy, Pause, Play, Trash2 } from 'lucide-react';
import { useChecklistTemplateStore } from '../../../store/checklistTemplateStore';
import { useOrganizationStore } from '../../../store/organizationStore';
import { ChecklistTemplateFormPanel } from './ChecklistTemplateFormPanel';
import { templateAssigneesSummary, appliesToSummary } from './checklistTemplateUtils';
import { filterPositionOptions } from '../../automations/alertAssignmentUtils';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString();
}

export const ChecklistTemplatesPage: React.FC = () => {
  const {
    templates,
    form,
    openCreateForm,
    openEditForm,
    closeForm,
    duplicateTemplate,
    setTemplateStatus,
    deleteTemplate
  } = useChecklistTemplateStore();
  const { positions, employees, departments } = useOrganizationStore();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const orgContext = useMemo(() => ({
    positions: filterPositionOptions(positions.map(p => ({ id: p.id, name: p.name }))),
    employees: employees.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))
  }), [positions, employees]);

  const filtered = useMemo(() => templates.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  }), [templates, search, typeFilter, statusFilter]);

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) deleteTemplate(id);
  };

  return (
    <div className="cfg-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Checklist Templates</h1>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreateForm}>
          <Plus size={14} /> Add Template
        </button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search">
          <Search size={14} />
          <input placeholder="Search templates…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="cfg-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="onboarding">Onboarding</option>
          <option value="offboarding">Offboarding</option>
        </select>
        <select className="cfg-filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Template name</th>
                <th>Type</th>
                <th>Applies To</th>
                <th>Item count</th>
                <th>Default assignees</th>
                <th>Status</th>
                <th>Last updated</th>
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
                  <td>{t.type === 'onboarding' ? 'Onboarding' : 'Offboarding'}</td>
                  <td>{appliesToSummary(t, departments, positions)}</td>
                  <td>{t.items.length}</td>
                  <td>{templateAssigneesSummary(t, orgContext.positions, orgContext.employees)}</td>
                  <td><span className={`cfg-badge cfg-badge--${t.status}`}>{t.status}</span></td>
                  <td>{formatDate(t.updatedAt)}</td>
                  <td>
                    <div className="cfg-row-actions cfg-row-actions--labeled">
                      <button type="button" className="cfg-action-btn" onClick={() => openEditForm(t.id)}>
                        <Edit size={13} /> Edit
                      </button>
                      <button type="button" className="cfg-action-btn" onClick={() => duplicateTemplate(t.id)}>
                        <Copy size={13} /> Duplicate
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn"
                        onClick={() => setTemplateStatus(t.id, t.status === 'active' ? 'inactive' : 'active')}
                      >
                        {t.status === 'active' ? <Pause size={13} /> : <Play size={13} />}
                        {t.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        type="button"
                        className="cfg-action-btn cfg-action-btn--danger"
                        onClick={() => handleDelete(t.id, t.name)}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="cfg-empty">
              <p className="cfg-empty__title">No templates found</p>
            </div>
          )}
        </div>
      </div>

      {form.open && <ChecklistTemplateFormPanel onClose={closeForm} />}
    </div>
  );
};
