import React, { useMemo, useState } from 'react';
import { Search, Plus, Edit, Copy, Pause, Play, Trash2, Eye, X, CheckCircle2, Clock3, Circle } from 'lucide-react';
import { useChecklistTemplateStore } from '../../../store/checklistTemplateStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { ChecklistTemplateFormPanel } from './ChecklistTemplateFormPanel';
import type { ChecklistTemplate } from './checklistTemplateTypes';

const statusLabel = { completed: 'Completed', pending: 'Pending', todo: 'Todo' } as const;
type DocumentStatus = keyof typeof statusLabel;

export const ChecklistTemplatesPage: React.FC = () => {
  const { templates, form, openCreateForm, openEditForm, closeForm, duplicateTemplate, setTemplateStatus, deleteTemplate } = useChecklistTemplateStore();
  const tasks = useChecklistTaskStore(s => s.tasks);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewing, setViewing] = useState<ChecklistTemplate | null>(null);

  const filtered = useMemo(() => templates.filter(template => {
    if (typeFilter !== 'all' && template.type !== typeFilter) return false;
    if (search && !template.name.toLowerCase().includes(search.toLowerCase())) return false;
    return statusFilter === 'all' || template.status === statusFilter;
  }), [templates, search, typeFilter, statusFilter]);

  const progress = useMemo(() => {
    if (!viewing) return [];
    const liveTasks = tasks.filter(task => task.templateId === viewing.id && task.requiredDocument);
    return viewing.items.map((item, index) => {
      const live = liveTasks.find(task => task.requiredDocument === item.requiredDocument);
      const fallback: DocumentStatus = index < Math.ceil(viewing.items.length * .4)
        ? 'completed'
        : index < Math.ceil(viewing.items.length * .65) ? 'pending' : 'todo';
      return {
        name: item.requiredDocument || item.title,
        assignee: live?.assigneeLabel || 'Reporting Manager',
        dueDate: live ? `${live.dueDate}${live.dueTime ? ` at ${live.dueTime}` : ''}` : 'Awaiting onboarding date',
        status: (live?.status || fallback) as DocumentStatus
      };
    });
  }, [viewing, tasks]);

  const counts = useMemo(() => ({
    total: progress.length,
    completed: progress.filter(item => item.status === 'completed').length,
    todo: progress.filter(item => item.status === 'todo').length,
    pending: progress.filter(item => item.status === 'pending').length
  }), [progress]);

  const handleDelete = (template: ChecklistTemplate) => {
    if (window.confirm(`Delete "${template.name}"? This cannot be undone.`)) deleteTemplate(template.id);
  };

  return (
    <div className="cfg-page onboarding-todo-page">
      <div className="cfg-page__header">
        <div>
          <h1 className="cfg-page__title">Checklist</h1>
          <p className="cfg-page__subtitle">Manage onboarding and offboarding checklist templates.</p>
        </div>
        <button type="button" className="org-btn org-btn--primary" onClick={openCreateForm}><Plus size={14} /> Add Checklist</button>
      </div>

      <div className="cfg-page__toolbar">
        <div className="cfg-search"><Search size={14} /><input placeholder="Search checklists..." value={search} onChange={event => setSearch(event.target.value)} /></div>
        <select className="cfg-filter-select" aria-label="Checklist type" value={typeFilter} onChange={event => setTypeFilter(event.target.value)}>
          <option value="all">All</option>
          <option value="onboarding">Onboarding</option>
          <option value="offboarding">Offboarding</option>
        </select>
        <select className="cfg-filter-select" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
          <option value="all">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="cfg-page__body onboarding-todo-grid">
        {filtered.map(template => (
          <article className="onboarding-todo-card" key={template.id}>
            <div className="onboarding-todo-card__head">
              <div><h2>{template.name}</h2><p>{template.items.length} required documents</p></div>
              <span className={`cfg-badge cfg-badge--${template.status}`}>{template.status}</span>
            </div>
            <ul className="onboarding-todo-list">
              {template.items.map(item => (
                <li key={item.id}><span className="onboarding-todo-box" aria-hidden="true" /><span>{item.title}</span></li>
              ))}
            </ul>
            <div className="onboarding-todo-card__assignee"><span>Assigned to</span><strong>Reporting Manager</strong></div>
            <div className="onboarding-todo-card__actions">
              <button type="button" className="org-btn org-btn--primary" onClick={() => setViewing(template)}><Eye size={14} /> View</button>
              <button type="button" className="cfg-action-btn" title="Edit" aria-label={`Edit ${template.name}`} onClick={() => openEditForm(template.id)}><Edit size={14} /></button>
              <button type="button" className="cfg-action-btn" title="Duplicate" aria-label={`Duplicate ${template.name}`} onClick={() => duplicateTemplate(template.id)}><Copy size={14} /></button>
              <button type="button" className="cfg-action-btn" title={template.status === 'active' ? 'Deactivate' : 'Activate'} onClick={() => setTemplateStatus(template.id, template.status === 'active' ? 'inactive' : 'active')}>{template.status === 'active' ? <Pause size={14} /> : <Play size={14} />}</button>
              <button type="button" className="cfg-action-btn cfg-action-btn--danger" title="Delete" aria-label={`Delete ${template.name}`} onClick={() => handleDelete(template)}><Trash2 size={14} /></button>
            </div>
          </article>
        ))}
        {filtered.length === 0 && <div className="cfg-empty"><p className="cfg-empty__title">No checklists found</p></div>}
      </div>

      {viewing && (
        <div className="onboarding-progress-overlay" onMouseDown={() => setViewing(null)}>
          <section className="onboarding-progress" role="dialog" aria-modal="true" aria-labelledby="onboarding-progress-title" onMouseDown={event => event.stopPropagation()}>
            <header><div><span className="onboarding-progress__eyebrow">CEO document overview</span><h2 id="onboarding-progress-title">{viewing.name}</h2><p>Reporting Manager task updates</p></div><button className="cfg-action-btn" type="button" aria-label="Close" onClick={() => setViewing(null)}><X size={17} /></button></header>
            <div className="onboarding-progress__stats">
              <div><strong>{counts.total}</strong><span>Total documents</span></div>
              <div className="is-complete"><strong>{counts.completed}</strong><span>Completed</span></div>
              <div className="is-todo"><strong>{counts.todo}</strong><span>Todo</span></div>
              <div className="is-pending"><strong>{counts.pending}</strong><span>Pending</span></div>
            </div>
            <div className="onboarding-progress__list">
              {progress.map(item => (
                <div className="onboarding-progress__item" key={item.name}>
                  <span className={`onboarding-progress__status-icon is-${item.status}`}>{item.status === 'completed' ? <CheckCircle2 size={18} /> : item.status === 'pending' ? <Clock3 size={18} /> : <Circle size={18} />}</span>
                  <div><strong>{item.name}</strong><span>{item.assignee} - {item.dueDate}</span></div>
                  <span className={`onboarding-status onboarding-status--${item.status}`}>{statusLabel[item.status]}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
      {form.open && <ChecklistTemplateFormPanel onClose={closeForm} />}
    </div>
  );
};