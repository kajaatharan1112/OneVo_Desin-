import React, { useEffect, useState } from 'react';
import { Info, X } from 'lucide-react';
import { useSchedulesConfigStore } from '../../../store/schedulesConfigStore';
import {
  EMPTY_ASSIGNMENT_VALUES,
  type ScheduleAssignmentValues
} from './schedulesConfigTypes';
import { formatAssignedCount, validateScheduleAssignment } from './schedulesConfigUtils';
import { ScheduleAssignmentFields } from './ScheduleAssignmentFields';

export const ScheduleAssignmentModal: React.FC = () => {
  const { schedules, assignmentModal, closeAssignmentModal, saveAssignment } =
    useSchedulesConfigStore();

  const schedule = schedules.find(s => s.id === assignmentModal.scheduleId);
  const [values, setValues] = useState<ScheduleAssignmentValues>(EMPTY_ASSIGNMENT_VALUES());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (schedule) {
      setValues({
        assignmentTarget: schedule.assignmentTarget,
        departmentIds: [...schedule.departmentIds],
        employeeIds: [...schedule.employeeIds]
      });
    } else {
      setValues(EMPTY_ASSIGNMENT_VALUES());
    }
    setError(null);
  }, [schedule, assignmentModal]);

  if (!assignmentModal.open || !schedule) return null;

  const handleSave = () => {
    const validationError = validateScheduleAssignment(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = saveAssignment(schedule.id, values);
    if (!result.ok) {
      setError(result.error ?? 'Unable to save assignment.');
    }
  };

  return (
    <div className="schedules-cfg-modal-overlay schedules-cfg-modal-overlay--assignment" onClick={closeAssignmentModal}>
      <div
        className="schedules-cfg-modal schedules-cfg-assignment-modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Assign ${schedule.title}`}
        onClick={e => e.stopPropagation()}
      >
        <header className="schedules-cfg-modal__header">
          <div>
            <h2>Assign schedule</h2>
            <p className="schedules-cfg-assignment-modal__subtitle">{schedule.title}</p>
          </div>
          <button type="button" className="org-slideover__close" onClick={closeAssignmentModal} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="schedules-cfg-modal__body">
          {error && <p className="schedules-cfg-form-error">{error}</p>}

          <div className="schedules-cfg-priority-strip">
            <Info size={14} />
            <span>
              Employee assignment overrides department. Department overrides company default.
            </span>
          </div>

          <p className="schedules-cfg-assignment-modal__count">
            Currently assigned: <strong>{formatAssignedCount(schedule.assignedCount)}</strong>
          </p>

          <ScheduleAssignmentFields
            assignmentTarget={values.assignmentTarget}
            departmentIds={values.departmentIds}
            employeeIds={values.employeeIds}
            onTargetChange={target =>
              setValues(prev => ({
                ...prev,
                assignmentTarget: target,
                departmentIds: target === 'department' ? prev.departmentIds : [],
                employeeIds: target === 'employee' ? prev.employeeIds : []
              }))
            }
            onDepartmentIdsChange={ids => setValues(prev => ({ ...prev, departmentIds: ids }))}
            onEmployeeIdsChange={ids => setValues(prev => ({ ...prev, employeeIds: ids }))}
          />
        </div>

        <footer className="schedules-cfg-modal__footer">
          <button type="button" className="org-btn org-btn--secondary" onClick={closeAssignmentModal}>
            Cancel
          </button>
          <button type="button" className="org-btn org-btn--primary" onClick={handleSave}>
            Save Assignment
          </button>
        </footer>
      </div>
    </div>
  );
};
