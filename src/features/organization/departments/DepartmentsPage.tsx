import React from 'react';
import { Building, Plus } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { DepartmentTree } from './DepartmentTree';
import { DepartmentFormPanel } from './DepartmentFormPanel';
import { OrgToast } from '../components/OrgToast';

export const DepartmentsPage: React.FC = () => {
  const { departmentForm, openCreateDepartment, closeDepartmentForm } = useOrganizationStore();

  return (
    <div className="departments-page">
      <header className="departments-page__header">
        <div className="departments-page__title-row">
          <span className="departments-page__icon" aria-hidden>
            <Building size={22} />
          </span>
          <div>
            <h1 className="departments-page__title">Departments</h1>
            <p className="departments-page__subtitle">
              Organizational units that positions belong to. Department heads resolve through position assignments.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="org-btn org-btn--primary"
          onClick={() => openCreateDepartment(null)}
        >
          <Plus size={16} />
          Add Department
        </button>
      </header>

      <div className="departments-page__content">
        <DepartmentTree />
      </div>

      {departmentForm.open && (
        <DepartmentFormPanel onClose={closeDepartmentForm} />
      )}
      <OrgToast />
    </div>
  );
};
