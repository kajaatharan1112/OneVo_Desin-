import React from 'react';
import { Briefcase, Building, PanelLeftClose, ShieldCheck } from 'lucide-react';
import { useActorAccess } from '../../access/useActorAccess';

interface OrganizationSubNavPanelProps {
  activeId: string;
  onSelect: (id: string) => void;
  onCollapse: () => void;
}

export const OrganizationSubNavPanel: React.FC<OrganizationSubNavPanelProps> = ({
  activeId,
  onSelect,
  onCollapse
}) => {
  const { hasPermission } = useActorAccess();
  const canViewRoles = hasPermission('roles:view');
  return (
    <div className="sub-nav-panel org-sub-nav">
      <div className="sub-nav-panel__toolbar">
        <p className="sub-nav-panel__header">Organization</p>
        {canViewRoles && <button
          type="button"
          className="sub-nav-panel__collapse"
          onClick={onCollapse}
          aria-label="Collapse section menu"
          title="Collapse section menu"
        >
          <PanelLeftClose size={16} strokeWidth={2} aria-hidden />
        </button>}
      </div>

      <div className="sub-nav-section">
        <button
          type="button"
          className={`sub-nav-panel__item${activeId === 'positions' ? ' sub-nav-panel__item--active' : ''}`}
          onClick={() => onSelect('positions')}
          aria-current={activeId === 'positions' ? 'page' : undefined}
        >
          <span className="sub-nav-panel__item-icon"><Briefcase size={13} /></span>
          <span className="sub-nav-panel__item-label">Positions</span>
        </button>
        <button
          type="button"
          className={`sub-nav-panel__item${activeId === 'departments' ? ' sub-nav-panel__item--active' : ''}`}
          onClick={() => onSelect('departments')}
          aria-current={activeId === 'departments' ? 'page' : undefined}
        >
          <span className="sub-nav-panel__item-icon"><Building size={13} /></span>
          <span className="sub-nav-panel__item-label">Departments</span>
        </button>
        <button
          type="button"
          className={`sub-nav-panel__item${activeId === 'roles-permissions' ? ' sub-nav-panel__item--active' : ''}`}
          onClick={() => onSelect('roles-permissions')}
          aria-current={activeId === 'roles-permissions' ? 'page' : undefined}
        >
          <span className="sub-nav-panel__item-icon"><ShieldCheck size={13} /></span>
          <span className="sub-nav-panel__item-label">Roles and Permission</span>
        </button>
      </div>
    </div>
  );
};
