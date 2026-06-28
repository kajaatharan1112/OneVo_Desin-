import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, History, Plus, UploadCloud, Users } from 'lucide-react';
import { useOrganizationStore } from '../../../store/organizationStore';
import { useBulkOnboardingStore } from '../../../store/bulkOnboardingStore';
import { useChecklistTaskStore } from '../../../store/checklistTaskStore';
import { useChecklistTemplateStore } from '../../../store/checklistTemplateStore';
import { ConfigShellHeader } from '../../../shared/components/config-shell-header/ConfigShellHeader';
import { OrgToast } from '../../organization/components/OrgToast';
import { EmployeeFormPanel } from './EmployeeFormPanel';
import { AddEmployeeWizard } from './AddEmployeeWizard';
import { BulkOnboardingModal } from '../bulk-onboarding/BulkOnboardingModal';
import { ImportHistoryModal } from '../bulk-onboarding/ImportHistoryModal';
import {
  employeeFullName,
  employeeStatusLabel,
  employmentTypeLabel,
  getEmployeeEmploymentContext
} from './employeeProfileUtils';

interface EmployeesPageProps {
  canAddEmployee?: boolean;
  canBulkOnboard?: boolean;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ canAddEmployee, canBulkOnboard }) => {
  const navigate = useNavigate();
  const {
    employees,
    positions,
    departments,
    assignments,
    employeeForm,
    closeEmployeeForm
  } = useOrganizationStore();

  const tasks = useChecklistTaskStore(state => state.tasks);
  const templates = useChecklistTemplateStore(state => state.templates);
  const [search, setSearch] = useState('');
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [bulkOnboardOpen, setBulkOnboardOpen] = useState(false);
  const [importHistoryOpen, setImportHistoryOpen] = useState(false);
  const { goToStep, importRuns } = useBulkOnboardingStore();

  const handleReopenForInvites = (runId: string) => {
    const run = importRuns.find(r => r.id === runId);
    if (!run) return;
    useBulkOnboardingStore.setState({ activeRunId: runId });
    goToStep('send-invitations');
    setImportHistoryOpen(false);
    setBulkOnboardOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return employees;
    return employees.filter(e => {
      const name = employeeFullName(e).toLowerCase();
      const ctx = getEmployeeEmploymentContext(e.id, positions, departments, assignments, employees);
      return (
        name.includes(q) ||
        e.email.toLowerCase().includes(q) ||
        ctx.positionName.toLowerCase().includes(q) ||
        ctx.departmentName.toLowerCase().includes(q)
      );
    });
  }, [employees, search, positions, departments, assignments]);

  const statusBadgeClass = (status: string) => {
    switch (status) {
      case 'active': return 'cfg-badge--active';
      case 'onboarding': return 'cfg-badge--warning';
      case 'offboarding': return 'cfg-badge--warning';
      default: return 'cfg-badge--inactive';
    }
  };

  return (
    <div className="cfg-page">
      <ConfigShellHeader
        title="Employees"
        icon={<Users size={15} />}
        search={{
          value: search,
          onChange: setSearch,
          placeholder: 'Search employees...',
          label: 'Search employees'
        }}
        actions={
          (canAddEmployee || canBulkOnboard) ? (
            <>
              {canAddEmployee && (
                <button type="button" className="org-btn org-btn--primary" onClick={() => setAddEmployeeOpen(true)}>
                  <Plus size={14} /> New Employee
                </button>
              )}
              {canBulkOnboard && (
                <>
                  <button type="button" className="org-btn org-btn--secondary" onClick={() => setBulkOnboardOpen(true)}>
                    <UploadCloud size={14} /> Bulk Onboard
                  </button>
                  <button type="button" className="org-btn org-btn--secondary" onClick={() => setImportHistoryOpen(true)}>
                    <History size={14} /> Import History
                  </button>
                </>
              )}
            </>
          ) : null
        }
      />

      <div className="cfg-page__body">
        <div className="cfg-table-wrap">
          <table className="cfg-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Position</th>
                <th>Department</th>
                <th>Task</th>
                <th>Due Time</th>
                <th>Reporting Manager Name</th>
                <th>Employment Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(employee => {
                const ctx = getEmployeeEmploymentContext(
                  employee.id, positions, departments, assignments, employees
                );
                const onboardingTasks = tasks.filter(task => task.employeeId === employee.id && task.templateType === 'onboarding');
                const firstTask = onboardingTasks[0];
                const checklistName = templates.find(template => template.id === firstTask?.templateId)?.name ?? 'Not assigned';
                return (
                  <tr key={employee.id}>
                    <td>
                      <div className="cfg-table__name">{employeeFullName(employee)}</div>
                      <div className="cfg-table__meta">{employee.email}</div>
                    </td>
                    <td>{ctx.positionName}</td>
                    <td>{ctx.departmentName}</td>
                    <td>
                      <select className="employee-task-select" value={firstTask?.templateId ?? ''} disabled aria-label={`Checklist for ${employeeFullName(employee)}`}>
                        <option value={firstTask?.templateId ?? ''}>{checklistName}</option>
                      </select>
                    </td>
                    <td>{firstTask ? `${firstTask.dueDate}${firstTask.dueTime ? ` at ${firstTask.dueTime}` : ''}` : '--'}</td>
                    <td>{firstTask?.assigneeLabel || ctx.reportingManager}</td>
                    <td>{employmentTypeLabel(employee.employmentType)}</td>
                    <td>
                      <span className={`cfg-badge ${statusBadgeClass(employee.status)}`}>
                        {employeeStatusLabel(employee.status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="org-btn org-btn--ghost org-btn--xs"
                        onClick={() => navigate(`/people/employees/${employee.id}`)}
                        title="View employee"
                      >
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {employeeForm.open && employeeForm.mode === 'edit' && <EmployeeFormPanel onClose={closeEmployeeForm} />}
      {addEmployeeOpen && <AddEmployeeWizard onClose={() => setAddEmployeeOpen(false)} />}
      {bulkOnboardOpen && <BulkOnboardingModal onClose={() => setBulkOnboardOpen(false)} />}
      {importHistoryOpen && <ImportHistoryModal onClose={() => setImportHistoryOpen(false)} onReopenForInvites={handleReopenForInvites} />}
      <OrgToast />
    </div>
  );
};
