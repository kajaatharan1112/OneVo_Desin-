import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GitBranch, List, Plus } from 'lucide-react';
import type { PositionTab } from '../../../types/organization';
import { useOrganizationStore } from '../../../store/organizationStore';
import { PositionOrgChart } from './PositionOrgChart';
import { PositionList } from './PositionList';
import { PositionFormPanel } from './PositionFormPanel';
import { AssignmentFormPanel } from './AssignmentFormPanel';
import { OrgToast } from '../components/OrgToast';
import { useActorAccess } from '../../access/useActorAccess';

const TABS: { id: PositionTab; label: string; icon: React.ReactNode }[] = [
  { id: 'org-chart', label: 'Org Chart', icon: <GitBranch size={15} /> },
  { id: 'list', label: 'Position List', icon: <List size={15} /> }
];

export const PositionsPage: React.FC = () => {
  const { hasPermission } = useActorAccess();
  const canCreatePosition = hasPermission('positions:create');
  const [activeTab, setActiveTab] = useState<PositionTab>('org-chart');
  const {
    positionForm,
    closePositionForm,
    assignmentForm,
    closeAssignEmployee,
    openCreateRootPosition
  } = useOrganizationStore();

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

            {canCreatePosition && <div className="positions-toolbar__actions">
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
            </div>}
          </div>
          <div className="positions-toolbar__divider" aria-hidden="true" />
        </div>

        <div className="positions-page__content">
          {activeTab === 'org-chart' && <PositionOrgChart />}
          {activeTab === 'list' && <PositionList />}
        </div>
      </div>

      {positionForm.open && createPortal(
        <PositionFormPanel onClose={closePositionForm} />,
        document.body
      )}
      {assignmentForm.open && createPortal(
        <AssignmentFormPanel onClose={closeAssignEmployee} />,
        document.body
      )}
      <OrgToast />
    </div>
  );
};
