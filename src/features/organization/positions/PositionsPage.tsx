import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, Circle, GitBranch, List, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { PositionTab } from '../../../types/organization';
import { useOrganizationStore } from '../../../store/organizationStore';
import { PositionOrgChart } from './PositionOrgChart';
import { PositionList } from './PositionList';
import { PositionFormPanel } from './PositionFormPanel';
import { OrgToast } from '../components/OrgToast';
import { useActorAccess } from '../../access/useActorAccess';
import { useRoleStore } from '../../../store/roleStore';

const TABS: { id: PositionTab; label: string; icon: React.ReactNode }[] = [
  { id: 'org-chart', label: 'Org Chart', icon: <GitBranch size={15} /> },
  { id: 'list', label: 'Position List', icon: <List size={15} /> }
];

export const PositionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useActorAccess();
  const canCreatePosition = hasPermission('positions:create');
  const [activeTab, setActiveTab] = useState<PositionTab>('list');
  const {
    positionForm,
    closePositionForm,
    openCreateRootPosition,
    departments,
    positions
  } = useOrganizationStore();
  const roles = useRoleStore(state => state.roles);
  const activeRoles = useMemo(() => roles.filter(role => role.active), [roles]);
  const showSetupGuide = positions.length === 0;

  return (
    <div className="positions-page">
      <div className="positions-page__inner">
        <header className="positions-page-header">
          <h1 className="cfg-page__title">Positions</h1>
          <p className="cfg-page__subtitle">
            Manage position hierarchy, reporting structure, and position-based assignments.
          </p>
        </header>

        <div className="positions-toolbar-wrap">
          <div className="positions-toolbar">
            <nav className="positions-tabs" aria-label="Position views">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`positions-page__tab${activeTab === tab.id ? ' positions-page__tab--active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="positions-toolbar__actions">
              {activeTab === 'org-chart' ? (
                <button
                  type="button"
                  className="org-btn org-btn--primary"
                  onClick={openCreateRootPosition}
                >
                  <Plus size={16} />
                  Add Root Position
                </button>
              ) : (
                <button
                  type="button"
                  className="org-btn org-btn--primary"
                  onClick={openCreateRootPosition}
                >
                  <Plus size={16} />
                  Add Position
                </button>
              )}
            </div>
          </div>
          <div className="positions-toolbar__divider" aria-hidden="true" />
        </div>

        <div className="positions-page__content">
          {showSetupGuide ? (
            <section className="org-setup-guide" aria-labelledby="org-setup-title">
              <div>
                <span className="org-setup-guide__eyebrow">Organization setup</span>
                <h2 id="org-setup-title">Build the organization in the right order</h2>
                <p>Departments define structure, roles define permissions, and positions connect both to the reporting hierarchy.</p>
              </div>
              <ol className="org-setup-guide__steps">
                <li>
                  {departments.length > 0 ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  <div><strong>1. Create Department</strong><span>Define where positions exist in the organization.</span></div>
                  <button type="button" className="org-btn org-btn--ghost" onClick={() => navigate('/organization/departments')}>Open Departments</button>
                </li>
                <li>
                  {activeRoles.length > 0 ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  <div><strong>2. Review Roles & Permissions</strong><span>Every position must have an active role.</span></div>
                  <button type="button" className="org-btn org-btn--ghost" onClick={() => navigate('/organization/roles-permissions')}>Open Roles</button>
                </li>
                <li>
                  <Circle size={20} />
                  <div><strong>3. Create Position</strong><span>Connect department, role, reporting manager, and coverage area.</span></div>
                  <button type="button" className="org-btn org-btn--primary" disabled={departments.length === 0 || activeRoles.length === 0} onClick={openCreateRootPosition}>Create Position</button>
                </li>
              </ol>
            </section>
          ) : <>
            {activeTab === 'org-chart' && <PositionOrgChart />}
            {activeTab === 'list' && <PositionList />}
          </>}
        </div>
      </div>

      {positionForm.open && createPortal(
        <PositionFormPanel
          key={`${positionForm.mode}-${positionForm.positionId ?? 'new'}-${positionForm.reportsToPositionId ?? 'root'}-${positionForm.departmentId ?? 'none'}`}
          onClose={closePositionForm}
        />,
        document.body
      )}
      <OrgToast />
    </div>
  );
};
