import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EmployeesPage } from './EmployeesPage';
import { EmployeeProfilePage } from './EmployeeProfilePage';

interface PeopleEmployeesRoutesProps {
  canAddEmployee?: boolean;
  canBulkOnboard?: boolean;
}

export const PeopleEmployeesRoutes: React.FC<PeopleEmployeesRoutesProps> = ({ canAddEmployee, canBulkOnboard }) => {
  return (
    <Routes>
      <Route path="/people/employees" element={<EmployeesPage canAddEmployee={canAddEmployee} canBulkOnboard={canBulkOnboard} />} />
      <Route path="/people/employees/:employeeId" element={<EmployeeProfilePage />} />
    </Routes>
  );
};
