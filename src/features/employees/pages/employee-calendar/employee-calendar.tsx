import React from 'react';
import { CeoCalendarDashboard } from '../../components/ceo-dashboard/ceo-calendar-dashboard';
import { TodayPanel } from '../../components/task-overview/widgets/today-panel';
import { useEmployeeContext } from '../../context/employee-context';

export const EmployeeCalendar: React.FC = () => {
  const { selectedEmployeeId } = useEmployeeContext();
  const isCeo = selectedEmployeeId === 'marcus';

  if (isCeo) {
    return (
      <div className="dashboard-page dashboard-page--employee-calendar">
        <CeoCalendarDashboard />
      </div>
    );
  }

  return (
    <div className="dashboard-page dashboard-page--employee-calendar">
      <div className="employee-calendar-overview" aria-label="Calendar">
        <TodayPanel />
      </div>
    </div>
  );
};
