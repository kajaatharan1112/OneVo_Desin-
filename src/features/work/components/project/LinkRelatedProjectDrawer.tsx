import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useWork } from '../../context/work-context';
import {
  healthLabel,
  linkableProjects,
  relationshipLabel,
  type RelatedProjectRelationship,
  type WorkProject,
} from '../../workMockData';
import { RequestProjectLinkModal } from './RequestProjectLinkModal';

interface Props {
  open: boolean;
  onClose: () => void;
  project: WorkProject;
}

const RELATIONSHIPS: RelatedProjectRelationship[] = ['parent', 'child', 'related', 'blocks', 'blocked_by'];

export const LinkRelatedProjectDrawer: React.FC<Props> = ({ open, onClose, project }) => {
  const { addRelatedProject, relatedProjects } = useWork();
  const [search, setSearch] = useState('');
  const [relationship, setRelationship] = useState<RelatedProjectRelationship>('related');
  const [requestOpen, setRequestOpen] = useState(false);

  const alreadyLinked = useMemo(
    () => new Set(
      relatedProjects
        .filter(l => l.projectId === project.id && l.relatedProjectId)
        .map(l => l.relatedProjectId as string),
    ),
    [relatedProjects, project.id],
  );

  const candidates = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return linkableProjects(project.id)
      .filter(p => !alreadyLinked.has(p.id))
      .filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.key.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
  }, [search, project.id, alreadyLinked]);

  if (!open) return null;

  const handleLink = (relatedProjectId: string) => {
    addRelatedProject(project.id, relatedProjectId, relationship);
    setSearch('');
    onClose();
  };

  return (
    <>
      <div className="org-slideover-backdrop" onClick={onClose}>
        <div className="org-slideover org-slideover--narrow" role="dialog" aria-modal="true" aria-label="Link related project" onClick={e => e.stopPropagation()}>
          <header className="org-slideover__header">
            <h2>Link related project</h2>
            <button type="button" className="org-slideover__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </header>
          <div className="org-slideover__body">
            <p className="admin-hint">
              Only projects you can already access appear here. Private projects from other teams are never listed.
            </p>
            <div className="org-form-field">
              <label htmlFor="rel-type">Relationship</label>
              <select id="rel-type" value={relationship} onChange={e => setRelationship(e.target.value as RelatedProjectRelationship)}>
                {RELATIONSHIPS.map(r => (
                  <option key={r} value={r}>{relationshipLabel(r)}</option>
                ))}
              </select>
            </div>
            <div className="cfg-search">
              <Search size={14} />
              <input
                placeholder="Search accessible projects…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {search.trim() && (
              <div className="work-invite-results work-invite-results--drawer">
                {candidates.map(p => (
                  <button key={p.id} type="button" className="work-invite-result" onClick={() => handleLink(p.id)}>
                    <span className="work-invite-result__info">
                      <span className="work-invite-result__name">{p.name}</span>
                      <span className="work-invite-result__meta">
                        {p.key} · {p.status.replace('_', ' ')} · {healthLabel(p.health)}
                      </span>
                    </span>
                  </button>
                ))}
                {candidates.length === 0 && (
                  <p className="admin-hint">No accessible projects match your search.</p>
                )}
              </div>
            )}
            <button type="button" className="org-btn org-btn--secondary org-btn--sm work-scope-request-btn" onClick={() => setRequestOpen(true)}>
              Request project link
            </button>
          </div>
          <footer className="org-slideover__footer">
            <button type="button" className="org-btn org-btn--secondary" onClick={onClose}>Cancel</button>
          </footer>
        </div>
      </div>
      <RequestProjectLinkModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        project={project}
        defaultRelationship={relationship}
      />
    </>
  );
};
