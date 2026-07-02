import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  Plus,
  X,
  Zap,
  Trash2,
  GripVertical,
  Menu,
} from 'lucide-react';
import { useWork } from '../context/work-context';
import type { WorkWorkspace } from '../workMockData';
import { CURRENT_USER_ID, MOCK_EMPLOYEES } from '../workMockData';
import { ProjectIconPicker } from './project/ProjectIconPicker';

/* ─── Types ─────────────────────────────────────────────────── */
interface WorkspaceStatus {
  id: string;
  name: string;
  color: string;
}

interface WorkspaceWizardDraft {
  // Step 1
  name: string;
  key: string;
  keyTouched: boolean;
  description: string;
  icon: string;
  visibility: 'private' | 'public_workspace';
  defaultPermission: 'full' | 'edit' | 'comment' | 'view';
  ownerId: string;
  logoUrl?: string;
  // Step 2
  type: 'scrum' | 'kanban' | 'project' | 'marketing' | 'hr' | 'custom';
  statuses: WorkspaceStatus[];
}

/* ─── Constants ─────────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Workspace Details', icon: <Layers size={16} /> },
  { id: 2, label: 'Choose Workspace Type', icon: <Menu size={16} /> },
  { id: 3, label: 'Review & Create', icon: <CheckCircle2 size={16} /> },
];

const WORKSPACE_TYPES = [
  { id: 'scrum', label: 'Scrum Board', emoji: '🏃', desc: 'Best for Agile teams.' },
  { id: 'kanban', label: 'Kanban Board', emoji: '📋', desc: 'Visual workflow management.' },
  { id: 'project', label: 'Project Management', emoji: '📅', desc: 'General project planning.' },
  { id: 'marketing', label: 'Marketing', emoji: '📢', desc: 'Campaign and content planning.' },
  { id: 'hr', label: 'HR', emoji: '👥', desc: 'Human resource management.' },
  { id: 'custom', label: 'Custom Workspace', emoji: '🛠️', desc: 'Create your own workflow.' },
];

const blankDraft = (): WorkspaceWizardDraft => ({
  name: '',
  key: '',
  keyTouched: false,
  description: '',
  icon: '🏢',
  visibility: 'private',
  defaultPermission: 'edit',
  ownerId: CURRENT_USER_ID,
  logoUrl: '',
  type: 'project',
  statuses: getDefaultStatuses('project'),
});

function getDefaultStatuses(type: string): WorkspaceStatus[] {
  const colors = ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
  let list: string[] = [];
  switch (type) {
    case 'scrum':
      list = ['Backlog', 'Sprint Ready', 'In Progress', 'Review', 'Testing', 'Done'];
      break;
    case 'kanban':
      list = ['To Do', 'Doing', 'Done'];
      break;
    case 'project':
      list = ['Planned', 'To Do', 'In Progress', 'Completed'];
      break;
    case 'marketing':
      list = ['Ideas', 'Planned', 'Running', 'Completed'];
      break;
    case 'hr':
      list = ['Applied', 'Interview', 'Selected', 'Onboarding', 'Completed'];
      break;
    case 'custom':
    default:
      list = ['To Do', 'In Progress', 'Done'];
      break;
  }
  return list.map((name, i) => ({
    id: `status-${Date.now()}-${i}`,
    name,
    color: colors[i % colors.length] || '#6366f1',
  }));
}

/* ─── Main Component ─────────────────────────────────────────── */
export const CreateWorkspaceDrawer: React.FC = () => {
  const { activeModal, closeModal, addWorkspace } = useWork();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<WorkspaceWizardDraft>(() => blankDraft());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const iconRef = useRef<HTMLButtonElement>(null);

  // Reset when open
  useEffect(() => {
    if (activeModal === 'create-workspace') {
      setDraft(blankDraft());
      setStep(1);
      setErrors({});
      setCreating(false);
    }
  }, [activeModal]);

  if (activeModal !== 'create-workspace') return null;

  /* ─── Validation ─────────────────────────────────────────── */
  const validate = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!draft.name.trim()) e.name = 'Workspace name is required.';
    }
    if (s === 2) {
      if (draft.statuses.length === 0) e.statuses = 'At least one status is required.';
      if (draft.statuses.some(st => !st.name.trim())) e.statuses = 'Status names cannot be blank.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (!validate(step)) return;
    setStep(s => Math.min(STEPS.length, s + 1));
  };
  const goBack = () => setStep(s => Math.max(1, s - 1));

  /* ─── Add/Edit Status Helpers ───────────────────────────── */
  const addStatus = () => {
    const colors = ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)] || '#6366f1';
    const newStatus: WorkspaceStatus = {
      id: `status-${Date.now()}`,
      name: `New Status`,
      color: randomColor,
    };
    setDraft(d => ({ ...d, statuses: [...d.statuses, newStatus] }));
  };

  const updateStatusName = (id: string, name: string) => {
    setDraft(d => ({
      ...d,
      statuses: d.statuses.map(st => (st.id === id ? { ...st, name } : st)),
    }));
  };

  const updateStatusColor = (id: string) => {
    const colors = ['#6366f1', '#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#0ea5e9'];
    setDraft(d => ({
      ...d,
      statuses: d.statuses.map(st => {
        if (st.id !== id) return st;
        const currentIdx = colors.indexOf(st.color);
        const nextColor = colors[(currentIdx + 1) % colors.length] || '#6366f1';
        return { ...st, color: nextColor };
      }),
    }));
  };

  const removeStatus = (id: string) => {
    setDraft(d => ({ ...d, statuses: d.statuses.filter(st => st.id !== id) }));
  };

  const handleDragOrder = (index: number, direction: 'up' | 'down') => {
    const list = [...draft.statuses];
    const targetIdx = index + (direction === 'up' ? -1 : 1);
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp!;
    setDraft(d => ({ ...d, statuses: list }));
  };

  /* ─── Submit Final Create ────────────────────────────────── */
  const handleCreateWorkspace = () => {
    if (!validate(step)) return;
    setCreating(true);

    const ownerObj = MOCK_EMPLOYEES.find(e => e.id === draft.ownerId) || { name: 'You', id: CURRENT_USER_ID };
    const ws: WorkWorkspace = {
      id: `ws-${Date.now()}`,
      name: draft.name.trim(),
      description: draft.description,
      ownerName: ownerObj.name,
      ownerId: ownerObj.id,
      memberCount: 1,
      linkedProjectCount: 0,
      status: 'active',
      icon: draft.icon,
      logoUrl: draft.logoUrl || undefined,
      type: draft.type,
    };

    addWorkspace(ws);
    closeModal();
    setCreating(false);
  };

  /* ─── Step Renderers ──────────────────────────────────────── */
  const renderStep1 = () => (
    <div className="cpw-step-content">
      <div className="cpw-step-header">
        <h2 className="cpw-step-title">Create Your Workspace</h2>
        <p className="cpw-step-desc">Set up the basic details for your workspace.</p>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', background: 'var(--surface-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <button
          ref={iconRef}
          type="button"
          className="cpw-icon-btn"
          style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
          onClick={() => setIconPickerOpen(true)}
          aria-label="Choose icon"
        >
          <span style={{ fontSize: '32px' }}>{draft.icon}</span>
        </button>
        <div style={{ flex: 1 }}>
          <label className="cpw-field-label" style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '13px' }}>Workspace Icon & Logo</label>
          <p className="cpw-hint" style={{ marginTop: 2, fontSize: '11px', color: 'var(--clr-text-secondary)' }}>Click the icon box to select an emoji, or upload an image file.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="org-btn org-btn--secondary org-btn--sm"
              style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px' }}
              onClick={() => {
                const file = window.prompt("Upload Workspace Logo (preset name/URL, e.g. engineering_shield.png):");
                if (file && file.trim()) {
                  setDraft(d => ({ ...d, logoUrl: file.trim(), icon: '🖼️' }));
                }
              }}
            >
              Upload Picture
            </button>
            {draft.logoUrl && (
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                ✓ {draft.logoUrl}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="cpw-field">
        <label className="cpw-field-label" htmlFor="wsw-name">
          Workspace Name <span className="cpw-required">*</span>
        </label>
        <input
          id="wsw-name"
          className={errors.name ? 'cpw-input cpw-input--error' : 'cpw-input'}
          value={draft.name}
          onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
          placeholder="e.g. Marketing, Engineering, HR..."
        />
        {errors.name && <p className="cpw-error">{errors.name}</p>}
      </div>

      <div className="cpw-field">
        <label className="cpw-field-label" htmlFor="wsw-desc">Workspace Description</label>
        <textarea
          id="wsw-desc"
          className="cpw-input cpw-textarea"
          value={draft.description}
          onChange={e => setDraft(d => ({ ...d, description: e.target.value }))}
          placeholder="Describe the purpose of this workspace..."
          rows={3}
        />
      </div>

      <div className="cpw-row cpw-row--2col" style={{ marginTop: '1rem' }}>
        <div className="cpw-field">
          <label className="cpw-field-label">Visibility</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: draft.visibility === 'private' ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                background: draft.visibility === 'private' ? 'var(--accent-bg)' : 'var(--surface)',
                color: draft.visibility === 'private' ? 'var(--accent)' : 'var(--text-h)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => setDraft(d => ({ ...d, visibility: 'private' }))}
            >
              <span style={{ fontSize: '14px' }}>🔒</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Private</div>
                <div style={{ fontSize: '0.65rem', color: draft.visibility === 'private' ? 'var(--accent)' : 'var(--clr-text-secondary)', opacity: 0.8 }}>Only invited members</div>
              </div>
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: draft.visibility === 'public_workspace' ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                background: draft.visibility === 'public_workspace' ? 'var(--accent-bg)' : 'var(--surface)',
                color: draft.visibility === 'public_workspace' ? 'var(--accent)' : 'var(--text-h)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onClick={() => setDraft(d => ({ ...d, visibility: 'public_workspace' }))}
            >
              <span style={{ fontSize: '14px' }}>🏢</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Public</div>
                <div style={{ fontSize: '0.65rem', color: draft.visibility === 'public_workspace' ? 'var(--accent)' : 'var(--clr-text-secondary)', opacity: 0.8 }}>Anyone in organization</div>
              </div>
            </button>
          </div>
        </div>

        <div className="cpw-field">
          <label className="cpw-field-label">Default Permission</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px', alignContent: 'center', height: '100%', minHeight: '44px' }}>
            {(['full', 'edit', 'comment', 'view'] as const).map(p => {
              const labelMap = { full: 'Full Edit', edit: 'Edit Only', comment: 'Comment', view: 'View Only' };
              const active = draft.defaultPermission === p;
              return (
                <button
                  key={p}
                  type="button"
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: active ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                    background: active ? 'var(--accent-bg)' : 'var(--surface-raised)',
                    color: active ? 'var(--accent)' : 'var(--text-h)',
                    fontSize: '0.74rem',
                    fontWeight: active ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.12s'
                  }}
                  onClick={() => setDraft(d => ({ ...d, defaultPermission: p }))}
                >
                  {labelMap[p]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cpw-field" style={{ marginTop: '1rem' }}>
        <label className="cpw-field-label" htmlFor="wsw-owner">Member Owner</label>
        <select
          id="wsw-owner"
          className="cpw-input cpw-select"
          value={draft.ownerId}
          onChange={e => setDraft(d => ({ ...d, ownerId: e.target.value }))}
        >
          {MOCK_EMPLOYEES.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name} ({emp.position})</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="cpw-step-content">
      <div className="cpw-step-header">
        <h2 className="cpw-step-title">How do you want to work?</h2>
        <p className="cpw-step-desc">Choose a template or create a custom workspace.</p>
      </div>

      <div className="cww-type-grid" style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px', marginBottom: '16px' }}>
        {WORKSPACE_TYPES.map(t => (
          <button
            key={t.id}
            type="button"
            className={`cww-type-card${draft.type === t.id ? ' cww-type-card--active' : ''}`}
            onClick={() => {
              setDraft(d => ({
                ...d,
                type: t.id as any,
                statuses: getDefaultStatuses(t.id),
              }));
            }}
          >
            <span className="cww-type-card__emoji">{t.emoji}</span>
            <h3 className="cww-type-card__title">{t.label}</h3>
            <p className="cww-type-card__desc" style={{ fontSize: '0.68rem', marginBottom: 0 }}>{t.desc}</p>
          </button>
        ))}
      </div>

      {/* Configure statuses list */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span className="cpw-field-label">Configure Workflow Statuses</span>
          <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={addStatus}>
            <Plus size={13} /> Add status
          </button>
        </div>

        <div className="cww-status-list" style={{ maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
          {draft.statuses.map((st, idx) => (
            <div key={st.id} className="cww-status-item">
              <GripVertical size={14} className="cww-status-item__drag" />
              <button
                type="button"
                className="cww-status-item__color"
                style={{ background: st.color }}
                onClick={() => updateStatusColor(st.id)}
                aria-label="Change color"
              />
              <input
                className="cww-status-item__input"
                value={st.name}
                onChange={e => updateStatusName(st.id, e.target.value)}
                aria-label={`Status lane name`}
              />
              <div className="cww-status-item__actions">
                <button
                  type="button"
                  className="cfg-action-btn"
                  disabled={idx === 0}
                  onClick={() => handleDragOrder(idx, 'up')}
                  aria-label="Move Up"
                >
                  ▲
                </button>
                <button
                  type="button"
                  className="cfg-action-btn"
                  disabled={idx === draft.statuses.length - 1}
                  onClick={() => handleDragOrder(idx, 'down')}
                  aria-label="Move Down"
                >
                  ▼
                </button>
                <button
                  type="button"
                  className="cpw-remove-btn"
                  onClick={() => removeStatus(st.id)}
                  aria-label="Remove status"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
        {errors.statuses && <p className="cpw-error">{errors.statuses}</p>}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const tmplLabel = WORKSPACE_TYPES.find(t => t.id === draft.type)?.label ?? 'Custom';
    return (
      <div className="cpw-step-content">
        <div className="cpw-step-header">
          <h2 className="cpw-step-title">Review & Create</h2>
          <p className="cpw-step-desc">Confirm your workspace settings.</p>
        </div>

        <div className="cpw-review-grid" style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }}>
          <div className="cpw-review-card">
            <div className="cpw-review-card__rows">
              <div className="cpw-review-row"><span>Workspace Name</span><strong>{draft.name}</strong></div>
              <div className="cpw-review-row"><span>Workspace Type</span><strong>{tmplLabel}</strong></div>
              <div className="cpw-review-row">
                <span>Workflow</span>
                <span className="cpw-tags-inline">
                  {draft.statuses.map(st => (
                    <span key={st.id} className="cpw-tag cpw-tag--sm" style={{ background: `${st.color}15`, color: st.color, borderColor: st.color }}>
                      {st.name}
                    </span>
                  ))}
                </span>
              </div>
              <div className="cpw-review-row"><span>Visibility</span><strong>{draft.visibility === 'private' ? '🔒 Private' : '🏢 Public'}</strong></div>
              <div className="cpw-review-row"><span>Permissions</span><strong>{draft.defaultPermission === 'full' ? 'Full Edit' : draft.defaultPermission}</strong></div>
            </div>
          </div>

          <div className="cpw-review-card">
            <div className="cpw-review-card__head" style={{ fontSize: '0.78rem', color: 'var(--clr-text-secondary)' }}>
              Auto Create Folder Structure:
            </div>
            <div className="cww-struct-tree" style={{ marginTop: '8px', fontSize: '0.75rem', lineHeight: '1.4' }}>
              {draft.name || 'Workspace'}<br />
              ├── Home<br />
              ├── My Work<br />
              ├── Projects<br />
              ├── Calendar<br />
              ├── Documents<br />
              ├── Team<br />
              └── Settings
            </div>
          </div>
        </div>

        <div className="cpw-create-hint" style={{ marginTop: '14px' }}>
          <Info size={14} />
          Clicking <strong>Create Workspace</strong> will automatically initialize projects, default views, structure hierarchy tree, and calendar components.
        </div>
      </div>
    );
  };

  const stepContent = [
    renderStep1,
    renderStep2,
    renderStep3,
  ];

  /* ─── Main Render ─────────────────────────────────────────── */
  return (
    <div className="cpw-backdrop" onClick={closeModal} role="presentation">
      <div
        className="cpw-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Create workspace wizard"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left sidebar ──────────────────────────────── */}
        <aside className="cpw-sidebar">
          <div className="cpw-sidebar__brand">
            <Building2 size={20} style={{ color: 'var(--accent)' }} />
            <span>Create Workspace</span>
          </div>

          {/* Preview card */}
          {/* Preview card */}
          <div
            className="qcm-preview-card"
            style={{
              margin: '16px 14px 20px',
              width: 'auto',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              className="qcm-preview-cover"
              style={{
                height: '70px',
                width: '100%',
                background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #000) 100%)',
                transition: 'background 0.2s'
              }}
            />
            <div
              className="qcm-preview-body"
              style={{
                padding: '20px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textAlign: 'left'
              }}
            >
              <div
                className="qcm-preview-icon-container"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '10px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-44px',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                  zIndex: 2
                }}
              >
                {draft.logoUrl ? (
                  draft.logoUrl.startsWith('http') || draft.logoUrl.includes('/') || draft.logoUrl.includes('.') ? (
                    <img
                      src={draft.logoUrl}
                      alt={draft.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('span');
                          fallback.innerText = '🖼️';
                          fallback.style.fontSize = '20px';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '8px', fontWeight: 700, padding: '2px', textAlign: 'center', wordBreak: 'break-all', lineHeight: 1.1 }}>
                      <span style={{ fontSize: '14px' }}>🖼️</span>
                    </div>
                  )
                ) : (
                  <span style={{ fontSize: '24px' }}>{draft.icon}</span>
                )}
              </div>

              <h4
                className="qcm-preview-name"
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  color: 'var(--text-h)',
                  margin: '16px 0 6px 0',
                  wordBreak: 'break-word',
                  lineHeight: '1.35',
                  textAlign: 'left',
                  fontFamily: 'Outfit, Inter, sans-serif'
                }}
              >
                {draft.name || 'Untitled Workspace'}
              </h4>

              <span
                className="qcm-preview-type"
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  marginBottom: '16px',
                  textAlign: 'left'
                }}
              >
                {draft.type ? draft.type.charAt(0).toUpperCase() + draft.type.slice(1) : 'General'} Template
              </span>

              <div
                className="qcm-preview-workspace"
                style={{
                  width: '100%',
                  fontSize: '0.75rem',
                  color: 'var(--clr-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  borderTop: '1px solid var(--border)',
                  paddingTop: '12px'
                }}
              >
                <span>🔒 Private Workspace</span>
              </div>
            </div>
          </div>

          {/* Steps */}
          <nav className="cpw-sidebar__steps" aria-label="Wizard steps" style={{ marginTop: '8px' }}>
            {STEPS.map((s) => {
              const done = step > s.id;
              const active = step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`cpw-step-btn${active ? ' cpw-step-btn--active' : ''}${done ? ' cpw-step-btn--done' : ''}`}
                  onClick={() => { if (done || active) { if (validate(step)) setStep(s.id); } }}
                  disabled={s.id > step + 1}
                  aria-current={active ? 'step' : undefined}
                >
                  <span className="cpw-step-btn__num">
                    {done ? <Check size={12} /> : s.id}
                  </span>
                  <span className="cpw-step-btn__icon">{s.icon}</span>
                  <span className="cpw-step-btn__label" style={{ fontSize: '11px' }}>{s.label}</span>
                  {s.id < STEPS.length && (
                    <ChevronRight size={13} className="cpw-step-btn__arrow" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="cpw-sidebar__footer" style={{ padding: '0 16px' }}>
            <p className="cpw-sidebar__progress-label">Step {step} of {STEPS.length}</p>
            <div className="cpw-sidebar__progress-bar">
              <div
                className="cpw-sidebar__progress-fill"
                style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </aside>

        {/* ── Right panel ───────────────────────────────── */}
        <div className="cpw-panel">
          {/* Panel header */}
          <header className="cpw-panel__header">
            <div className="cpw-panel__header-left">
              <span className="cpw-panel__step-badge">
                {STEPS[step - 1]?.icon}
                {STEPS[step - 1]?.label}
              </span>
            </div>
            <button
              type="button"
              className="cpw-close-btn"
              onClick={closeModal}
              aria-label="Close wizard"
            >
              <X size={18} />
            </button>
          </header>

          {/* Scrollable content */}
          <div className="cpw-panel__body">
            {stepContent[step - 1]?.()}
          </div>

          {/* Footer navigation */}
          <footer className="cpw-panel__footer">
            <button
              type="button"
              className="org-btn org-btn--secondary"
              onClick={step === 1 ? closeModal : goBack}
            >
              {step === 1 ? 'Cancel' : <><ArrowLeft size={14} /> Back</>}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {/* Dot progress */}
              <div className="cpw-footer-dots">
                {STEPS.map(s => (
                  <div
                    key={s.id}
                    className={`cpw-footer-dot${step === s.id ? ' cpw-footer-dot--active' : ''}${step > s.id ? ' cpw-footer-dot--done' : ''}`}
                  />
                ))}
              </div>

              {step < STEPS.length ? (
                <button type="button" className="org-btn org-btn--primary" onClick={goNext}>
                  Next <ArrowRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  className="org-btn org-btn--primary cpw-create-btn"
                  onClick={handleCreateWorkspace}
                  disabled={creating}
                >
                  <Zap size={14} />
                  {creating ? 'Creating…' : 'Create Workspace'}
                </button>
              )}
            </div>
          </footer>
        </div>
      </div>

      {/* Emoji picker modal */}
      <ProjectIconPicker
        open={iconPickerOpen}
        anchorRef={iconRef}
        value={draft.icon}
        onChange={icon => setDraft(d => ({ ...d, icon }))}
        onClose={() => setIconPickerOpen(false)}
      />
    </div>
  );
};
