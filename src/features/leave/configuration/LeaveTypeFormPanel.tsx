import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useLeaveConfigStore } from '../../../store/leaveConfigStore';

interface LeaveTypeFormPanelProps {
  onClose: () => void;
}

function codeFromName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 12) || 'LEAVE';
}

export const LeaveTypeFormPanel: React.FC<LeaveTypeFormPanelProps> = ({ onClose }) => {
  const { leaveTypeForm, leaveTypes, saveLeaveType } = useLeaveConfigStore();
  const existing = leaveTypeForm.leaveTypeId
    ? leaveTypes.find(t => t.id === leaveTypeForm.leaveTypeId)
    : null;
  const isEdit = leaveTypeForm.mode === 'edit';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [paidLeave, setPaidLeave] = useState(true);
  const [active, setActive] = useState(true);
  const [genderApplicability, setGenderApplicability] = useState<'all' | 'male' | 'female'>('all');

  useEffect(() => {
    if (isEdit && existing) {
      setName(existing.name);
      setDescription(existing.description);
      setPaidLeave(existing.paidLeave);
      setActive(existing.active);
      setGenderApplicability(existing.genderApplicability ?? 'all');
    } else {
      setName('');
      setDescription('');
      setPaidLeave(true);
      setActive(true);
      setGenderApplicability('all');
    }
  }, [isEdit, existing, leaveTypeForm]);

  const handleSave = () => {
    if (!name.trim()) return;
    saveLeaveType({
      id: existing?.id,
      name: name.trim(),
      code: existing?.code ?? codeFromName(name),
      category: existing?.category ?? 'Custom',
      description,
      paidLeave,
      active,
      status: active ? 'active' : 'inactive',
      genderApplicability
    });
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div
        className="org-slideover org-slideover--narrow"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit leave type' : 'Create leave type'}
        onClick={e => e.stopPropagation()}
      >
        <header className="org-slideover__header">
          <h2>{isEdit ? 'Edit Leave Type' : 'Create Leave Type'}</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="org-slideover__body">
          <div className="org-form-field">
            <label>Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="org-form-field">
            <label>Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="org-form-field">
            <label>Applicable Gender</label>
            <select
              value={genderApplicability}
              onChange={e => setGenderApplicability(e.target.value as any)}
            >
              <option value="all">All</option>
              <option value="male">Male Only</option>
              <option value="female">Female Only</option>
            </select>
          </div>
          <label className="leave-cfg-toggle">
            <input type="checkbox" checked={paidLeave} onChange={e => setPaidLeave(e.target.checked)} />
            Paid Leave
          </label>
          <label className="leave-cfg-toggle">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Active
          </label>
        </div>

        <footer className="org-slideover__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>Save</button>
        </footer>
      </div>
    </div>
  );
};
