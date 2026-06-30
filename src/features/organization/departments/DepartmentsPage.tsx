import React from 'react';
import { Plus } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { DepartmentTree } from './DepartmentTree';
import { DepartmentFormPanel } from './DepartmentFormPanel';
import { OrgToast } from '../components/OrgToast';

export const DepartmentsPage: React.FC = () => {
  const { departmentForm, openCreateDepartment, closeDepartmentForm } = useOrganizationStore();

  return (
    <div className="departments-page">
      <header className="cfg-page__header departments-page__header">
        <div>
          <h1 className="cfg-page__title">Departments</h1>
          <p className="cfg-page__subtitle">
            Organizational units that positions belong to. Department heads resolve through position assignments.
          </p>
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
        <DepartmentFormPanel
          key={`${departmentForm.mode}-${departmentForm.departmentId ?? 'new'}-${departmentForm.parentDepartmentId ?? 'root'}`}
          onClose={closeDepartmentForm}
        />
      )}
      <OrgToast />
    </div>
  );
};
