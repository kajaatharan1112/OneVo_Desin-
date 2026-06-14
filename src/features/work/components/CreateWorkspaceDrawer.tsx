import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork, type WorkspaceRole } from '../context/work-context';
import type { WorkWorkspace } from '../workMockData';

const MEMBER_SOURCES = ['My Reporting Team', 'Existing Team', 'Manual Invite'] as const;
type MemberSource = (typeof MEMBER_SOURCES)[number];
const WORKSPACE_ROLES: WorkspaceRole[] = ['admin', 'member', 'viewer'];

export const CreateWorkspaceDrawer: React.FC = () => {
  const { activeModal, closeModal, addWorkspace } = useWork();
  const [form, setForm] = useState<{
    name: string;
    description: string;
    memberSource: MemberSource;
    members: string;
    role: WorkspaceRole;
  }>({
    name: '',
    description: '',
    memberSource: MEMBER_SOURCES[0],
    members: 'Priya Sharma, Maria Lopez',
    role: 'admin' as WorkspaceRole,
  });

  if (activeModal !== 'create-workspace') return null;

  const handleCreate = () => {
    if (!form.name.trim()) return;
    const ws: WorkWorkspace = {
      id: `ws-${Date.now()}`,
      name: form.name.trim(),
      description: form.description,
      ownerName: 'You',
      memberCount: form.members.split(',').filter(Boolean).length,
      linkedProjectCount: 0,
      status: 'active',
    };
    addWorkspace(ws);
    closeModal();
    setForm({ name: '', description: '', memberSource: MEMBER_SOURCES[0], members: '', role: 'admin' });
  };

  return (
    <div className="org-slideover-backdrop" onClick={closeModal}>
      <div className="org-slideover org-slideover--narrow" role="dialog" aria-modal="true" aria-label="Create workspace" onClick={e => e.stopPropagation()}>
        <header className="org-slideover__header">
          <h2>Create Workspace</h2>
          <button type="button" className="org-slideover__close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="org-slideover__body">
          <p className="admin-hint">Workspace roles are local to this work context only. They do not grant tenant-wide HR, security, or payroll permissions.</p>
          <div className="org-form-field">
            <label htmlFor="ws-name">Workspace Name</label>
            <input id="ws-name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="ws-desc">Description</label>
            <textarea id="ws-desc" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="org-form-field">
            <label htmlFor="ws-source">Member Source</label>
            <select id="ws-source" value={form.memberSource} onChange={e => setForm(f => ({ ...f, memberSource: e.target.value as MemberSource }))}>
              {MEMBER_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="ws-members">Members</label>
            <input id="ws-members" value={form.members} onChange={e => setForm(f => ({ ...f, members: e.target.value }))} placeholder="Comma-separated names" />
          </div>
          <div className="org-form-field">
            <label htmlFor="ws-role">Workspace Role</label>
            <select id="ws-role" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as WorkspaceRole }))}>
              {WORKSPACE_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeModal}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!form.name.trim()} onClick={handleCreate}>Create Workspace</button>
        </footer>
      </div>
    </div>
  );
};
