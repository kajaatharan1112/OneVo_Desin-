import React, { useMemo, useState } from 'react';
import { Search, Trash2, UserCircle, UserPlus } from 'lucide-react';
import { useWork } from '../../context/work-context';
import { CompactPillDropdown, type PillDropdownOption } from '../CompactPillDropdown';
import {
  CURRENT_USER_ID,
  employeeById,
  inviteableEmployees,
  type ProjectAccessLevel,
  type ProjectMember,
  type WorkProject,
} from '../../workMockData';
import { AddMemberDrawer } from './AddMemberDrawer';

interface Props {
  project: WorkProject;
}

function memberJoinedLabel(member: ProjectMember): string {
  const seed = member.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const d = new Date(2026, 5, 1 + (seed % 28));
  return `Joined ${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export const ProjectMembersSettings: React.FC<Props> = ({ project }) => {
  const { updateProject, removeProjectMember, updateProjectMemberAccess } = useWork();
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [leadId, setLeadId] = useState(project.leadId);

  const leadOptions = useMemo((): PillDropdownOption[] => {
    const ids = new Set<string>([CURRENT_USER_ID, project.leadId]);
    project.workspaceIds.forEach(wsId => {
      inviteableEmployees([wsId], [], CURRENT_USER_ID).forEach(e => ids.add(e.id));
    });
    return [...ids].map(id => {
      const emp = employeeById(id);
      return {
        id,
        label: id === CURRENT_USER_ID ? 'You' : (emp?.name ?? id),
        subtext: emp?.position,
      };
    });
  }, [project.leadId, project.workspaceIds]);

  const filteredMembers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return project.members;
    return project.members.filter(m => {
      const emp = employeeById(m.employeeId);
      return (
        emp?.name.toLowerCase().includes(q) ||
        emp?.position.toLowerCase().includes(q) ||
        m.accessLevel.includes(q)
      );
    });
  }, [project.members, search]);

  return (
    <div className="work-members-page">
      <div className="work-members-lead">
        <div className="work-members-lead__info">
          <span className="work-members-lead__label">Project lead</span>
          <p className="work-members-lead__helper">Select the project lead for the project.</p>
        </div>
        <CompactPillDropdown
          icon={<UserCircle size={14} />}
          value={leadId}
          options={leadOptions}
          onChange={id => {
            setLeadId(id);
            updateProject(project.id, { leadId: id });
          }}
          ariaLabel="Project lead"
        />
      </div>

      <div className="work-members-section">
        <div className="work-members-section__header">
          <h3 className="work-members-section__title">Members</h3>
          <div className="work-members-section__actions">
            <div className="cfg-search work-members-section__search">
              <Search size={14} />
              <input
                placeholder="Search members…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search members"
              />
            </div>
            <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={() => setAddMemberOpen(true)}>
              <UserPlus size={14} /> Add member
            </button>
          </div>
        </div>

        <div className="work-members-list">
          {filteredMembers.map(member => {
            const emp = employeeById(member.employeeId);
            const name = emp?.name ?? member.employeeId;
            return (
              <div key={member.id} className="work-members-list__row">
                <span className="work-avatar-chip__circle work-members-list__avatar">
                  {name.slice(0, 2)}
                </span>
                <div className="work-members-list__info">
                  <span className="work-members-list__name">{name}</span>
                  <select
                    className="work-members-list__role"
                    value={member.accessLevel}
                    onChange={e => updateProjectMemberAccess(project.id, member.id, e.target.value as ProjectAccessLevel)}
                    aria-label={`Role for ${name}`}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <span className="work-members-list__joined">{memberJoinedLabel(member)}</span>
                </div>
                <button
                  type="button"
                  className="work-members-list__remove"
                  onClick={() => removeProjectMember(project.id, member.id)}
                  aria-label={`Remove ${name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
          {filteredMembers.length === 0 && (
            <p className="work-members-list__empty">No members match your search.</p>
          )}
        </div>
      </div>

      <AddMemberDrawer open={addMemberOpen} onClose={() => setAddMemberOpen(false)} project={project} />
    </div>
  );
};
