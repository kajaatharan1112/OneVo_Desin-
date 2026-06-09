import { useMemo } from 'react';
import { useEmployeeContext } from '../context/employee-context';
import {
  getEmployeeData,
  getSprintCompletedPercent,
  getWorkWeekDaysRemaining
} from '../data/employee-data.registry';

export function useEmployeeData() {
  const { selectedEmployeeId, selectedEmployee } = useEmployeeContext();

  return useMemo(() => {
    const data = getEmployeeData(selectedEmployeeId);
    const { taskOverviewMetrics } = data;

    return {
      employee: selectedEmployee,
      employeeId: selectedEmployeeId,
      ...data,
      sprintCompletedPercent: getSprintCompletedPercent(taskOverviewMetrics),
      workWeekDaysRemaining: getWorkWeekDaysRemaining(taskOverviewMetrics)
    };
  }, [selectedEmployee, selectedEmployeeId]);
}
