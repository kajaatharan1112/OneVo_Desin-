import React, { useState } from 'react';
import { Briefcase, GitBranch, List, UserCheck } from 'lucide-react';
import type { PositionTab } from '../../../types/organization';
import { useOrganizationStore } from '../../../store/organizationStore';
import { PositionOrgChart } from './PositionOrgChart';
import { PositionList } from './PositionList';
import { PositionAssignments } from './PositionAssignments';
import { PositionFormPanel } from './PositionFormPanel';
import { AssignmentFormPanel } from './AssignmentFormPanel';
import { OrgToast } from '../components/OrgToast';

const TABS: { id: PositionTab; label: string; icon: React.ReactNode }[] = [
  { id: 'org-chart', label: 'Org Chart', icon: <GitBranch size={15} /> },
  { id: 'list', label: 'Position List', icon: <List size={15} /> },
  { id: 'assignments', label: 'Assignments', icon: <UserCheck size={15} /> }
];

export const PositionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PositionTab>('org-chart');
  const { positionForm, closePositionForm, assignmentForm, closeAssignEmployee } =
    useOrganizationStore();

  return (
    <div className="positions-page">
      <header className="positions-page__header">
        <div className="positions-page__title-row">
          <span className="positions-page__icon" aria-hidden>
            <Briefcase size={22} />
          </span>
          <div>
            <h1 className="positions-page__title">Positions</h1>
            <p className="positions-page__subtitle">
              Build reporting hierarchy visually. Managers are resolved from position assignments.
            </p>
          </div>
        </div>

        <nav className="positions-page__tabs" aria-label="Position views">
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
      </header>

      <div className="positions-page__content">
        {activeTab === 'org-chart' && <PositionOrgChart />}
        {activeTab === 'list' && <PositionList />}
        {activeTab === 'assignments' && <PositionAssignments />}
      </div>

      {positionForm.open && <PositionFormPanel onClose={closePositionForm} />}
      {assignmentForm.open && <AssignmentFormPanel onClose={closeAssignEmployee} />}
      <OrgToast />
    </div>
  );
};
