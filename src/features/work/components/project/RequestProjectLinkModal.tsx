import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  relationshipLabel,
  type RelatedProjectRelationship,
  type WorkProject,
} from '../../workMockData';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
  defaultRelationship?: RelatedProjectRelationship;
}

const RELATIONSHIPS: RelatedProjectRelationship[] = ['parent', 'child', 'related', 'blocks', 'blocked_by'];

export const RequestProjectLinkModal: React.FC<Props> = ({
  open,
  onClose,
  project,
  defaultRelationship = 'related',
}) => {
  const { requestRelatedProjectLink } = useWork();
  const [relationship, setRelationship] = useState<RelatedProjectRelationship>(defaultRelationship);
  const [manualLabel, setManualLabel] = useState('');
  const [manualKey, setManualKey] = useState('');
  const [reason, setReason] = useState('');

  if (!open) return null;

  const handleSubmit = () => {
    if (!reason.trim()) return;
    requestRelatedProjectLink(
      project.id,
      relationship,
      reason.trim(),
      manualLabel.trim() || undefined,
      manualKey.trim() || undefined,
    );
    setManualLabel('');
    setManualKey('');
    setReason('');
    onClose();
  };

  return (
    <div className="org-slideover-backdrop" onClick={onClose}>
      <div className="work-modal" role="dialog" aria-modal="true" aria-label="Request project link" onClick={e => e.stopPropagation()}>
        <header className="work-modal__header">
          <h2>Request project link</h2>
          <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="work-modal__body">
          <p className="admin-hint">
            Use this when the project you need is not visible. Hidden private projects are never suggested or autocomplete.
          </p>
          <div className="org-form-field">
            <label htmlFor="rpl-rel">Relationship</label>
            <select id="rpl-rel" value={relationship} onChange={e => setRelationship(e.target.value as RelatedProjectRelationship)}>
              {RELATIONSHIPS.map(r => (
                <option key={r} value={r}>{relationshipLabel(r)}</option>
              ))}
            </select>
          </div>
          <div className="org-form-field">
            <label htmlFor="rpl-name">Known project name (optional)</label>
            <input id="rpl-name" value={manualLabel} onChange={e => setManualLabel(e.target.value)} placeholder="e.g. Backend Refresh" />
          </div>
          <div className="org-form-field">
            <label htmlFor="rpl-key">Known project key (optional)</label>
            <input id="rpl-key" value={manualKey} onChange={e => setManualKey(e.target.value.toUpperCase())} placeholder="e.g. BEND" />
          </div>
          <div className="org-form-field">
            <label htmlFor="rpl-reason">Reason / purpose</label>
            <textarea id="rpl-reason" rows={3} value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </div>
        <footer className="work-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          <button type="button" className="org-btn org-btn--primary" disabled={!reason.trim()} onClick={handleSubmit}>
            Submit request
          </button>
        </footer>
      </div>
    </div>
  );
};
